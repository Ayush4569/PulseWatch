import pool from "../db/client.js";
import monitorQueue from "./queue.js"

const registerMonitorScheduler = async (monitorId: string, interval: number) => {
    try {
        await monitorQueue.upsertJobScheduler(`monitor:${monitorId}`,
            { every: interval * 1000 },
            {
                name: "health-check",
                data: { monitorId }
            }
        )
    } catch (error) {
        console.error('Error in scheduler', error);
        throw new Error("Error in scheduler");
    }
}

const removeMonitorScheduler = async (monitorId: string) => {
    await monitorQueue.removeJobScheduler(`monitor:${monitorId}`);
    const jobs = await monitorQueue.getJobs(["delayed", "waiting"]);
    for (const job of jobs) {
        if (job.data?.monitorId === monitorId) {
            await job.remove();
        }
    }
};
const reconcileSchedulers = async () => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT id, interval_seconds AS interval FROM monitors WHERE is_active = true`
        );
        const activeMonitors = result.rows;
        const activeMonitorIdSet = new Set(activeMonitors.map((m: { id: string }) => m.id));

        // Prune orphan schedulers from Redis that are no longer active in PostgreSQL
        try {
            const existingSchedulers = await monitorQueue.getJobSchedulers();
            for (const scheduler of existingSchedulers) {
                const schedulerId = scheduler.id || scheduler.key;
                if (schedulerId && schedulerId.startsWith("monitor:")) {
                    const monitorId = schedulerId.replace("monitor:", "");
                    if (!activeMonitorIdSet.has(monitorId)) {
                        console.log(`Pruning orphan scheduler from Redis: ${schedulerId}`);
                        await removeMonitorScheduler(monitorId);
                    }
                }
            }
        } catch (schedulerErr) {
            console.error("Failed to prune orphan schedulers from Redis:", schedulerErr);
        }

        // Register or update active monitors
        for (const monitor of activeMonitors) {
            await registerMonitorScheduler(monitor.id, monitor.interval);
        }
    } finally {
        client.release();
    }
};

export {
    registerMonitorScheduler,
    removeMonitorScheduler,
    reconcileSchedulers
}