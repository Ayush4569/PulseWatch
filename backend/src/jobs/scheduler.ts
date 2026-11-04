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
        for (const monitor of result.rows) {
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