
import { createServer } from "http";
import app from "./app.js";
import { config } from "./config/env.js";
import { initalizeSocket } from "./websocket/socket.js";
import { reconcileSchedulers } from "./jobs/scheduler.js";
import monitorQueue from "./jobs/queue.js";
import {
  redisPublisher,
  redisSubscriber,
} from "./config/redis.js";
import pool from "./db/client.js";

const PORT = config.PORT || 8000;

const httpServer = createServer(app);
const io = initalizeSocket(httpServer);

let isShuttingDown = false;

const startServer = async () => {
  try {
    await reconcileSchedulers();

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
  }
};

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Received ${signal}. Shutting down gracefully...`);

  // Unref so the fallback timer never holds the event loop alive
  const forceExitTimer = setTimeout(() => {
    console.error("Shutdown timed out. Force exiting...");
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  try {
    // 1. Close Socket.IO and terminate all underlying HTTP keep-alive TCP sockets
    console.log("Closing Socket.IO & HTTP connections...");
    httpServer.closeAllConnections();
    await new Promise<void>((resolve) => io.close(() => resolve()));

    // 2. Close BullMQ queue
    console.log("Closing BullMQ queue...");
    await monitorQueue.close();

    // 3. Drain PostgreSQL pool
    console.log("Closing PostgreSQL...");
    await pool.end();

    // 4. Unsubscribe and close Redis clients
    console.log("Closing Redis clients...");
    await redisSubscriber.unsubscribe();
    await Promise.all([
      redisPublisher.quit(),
      redisSubscriber.quit(),
    ]);

    clearTimeout(forceExitTimer);
    console.log("All services closed. Clean exit.");
    process.exitCode = 0;
  } catch (error) {
    console.error("Shutdown error:", error);
    process.exit(1);
  }
};

process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.once("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();