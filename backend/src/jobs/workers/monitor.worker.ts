import { Worker } from "bullmq";

import { connection } from "../queue.js";
import { performHealthCheckService } from "../../modules/checks/checks.service.js";
import { publishMonitorCheck } from "../../websocket/publisher.js";

import pool from "../../db/client.js";
import { redisPublisher } from "../../config/redis.js";

const processMonitor = new Worker(
  "Monitors",
  async (job) => {
    const { monitorId } = job.data;

    console.log(
      `Processing monitor ${monitorId} | Job: ${job.id} | Attempt: ${job.attemptsMade + 1}/${job.opts.attempts}`
    );

    const result = await performHealthCheckService(monitorId, job.id!);

    if (result) {
      try {
        await publishMonitorCheck(result.userId, result);
      } catch (pubError) {
        console.warn(
          `Failed to publish live event for monitor ${monitorId}:`,
          pubError
        );
      }
    }
  },
  {
    connection,
    concurrency: 10,
    drainDelay: 30,
    stalledInterval: 120000,
  }
);

processMonitor.on("completed", (job) => {
  console.log(`Job ${job.id} completed for monitor ${job.data.monitorId}`);
});

processMonitor.on("failed", (job, error) => {
  console.error("Monitor job failed:", {
    jobId: job?.id,
    monitorId: job?.data.monitorId,
    attemptsMade: job?.attemptsMade,
    maxAttempts: job?.opts.attempts,
    error: error.message,
  });
});

processMonitor.on("error", (error) => {
  console.error("BullMQ worker error:", error);
});

const gracefulWorkerShutdown = async (signal: string) => {
  console.log(`Worker received ${signal}. Shutting down gracefully...`);
  try {
    await processMonitor.close();
    await pool.end();
    redisPublisher.disconnect();
    console.log("Worker shut down cleanly.");
    process.exit(0);
  } catch (error) {
    console.error("Error during worker shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulWorkerShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulWorkerShutdown("SIGINT"));

export default processMonitor;