import monitorQueue from "./queues.js";
const monitorId = "0eef8f80-3b20-4735-8a07-77dda2a46067";
const job = await monitorQueue.add('health-check',{monitorId})
console.log(`Job added successfully. Job ID: ${job.id}`);

await monitorQueue.close();