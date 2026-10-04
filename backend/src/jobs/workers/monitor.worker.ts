import { Worker } from "bullmq";

import { connection } from "../queue.js";
import { performHealthCheckService } from "../../modules/checks/checks.service.js";
import { publishMonitorCheck } from "../../websocket/publisher.js";

const processMonitor = new Worker(
  "Monitors",
  async (job) => {
    const { monitorId } = job.data;
    console.log(
      `Processing job ${job.id} for monitor ${monitorId}...`
    );
    const {userId,...data} = await performHealthCheckService(monitorId);
    await publishMonitorCheck(userId, data);
  },
  { connection }
);
processMonitor.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

processMonitor.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});

export default processMonitor;