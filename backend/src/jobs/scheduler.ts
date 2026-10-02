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
    try {
        await monitorQueue.removeJobScheduler(`monitor:${monitorId}`)
    } catch (error) {
        console.error('Error removing scheduler', error);
        throw new Error("Error removing scheduler");
    }
}

export {
    registerMonitorScheduler,
    removeMonitorScheduler
}