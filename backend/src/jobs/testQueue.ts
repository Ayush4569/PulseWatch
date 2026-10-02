import monitorQueue from "./queue.js";
import { registerMonitorScheduler } from "./scheduler.js";
const monitorId = "72c56aac-8b95-4b3f-aa56-bd1e810ec577";
const interval = 30;
await registerMonitorScheduler(monitorId, interval);

console.log(
    `Scheduler registered for monitor ${monitorId} every ${interval} seconds`
);

await monitorQueue.close();