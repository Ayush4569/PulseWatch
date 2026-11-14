import { Queue } from "bullmq";
import { config } from "../config/env.js";
const parsed = new URL(config.REDIS_URL);
export const connection = {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    tls: parsed.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
    keepAlive: 30000,
};
const monitorQueue = new Queue("Monitors",{
    connection,
    defaultJobOptions : {
        attempts:3,
        backoff : {
            type:"exponential",
            delay:2000
        },
        removeOnComplete:1000,
        removeOnFail:5000
    }
});
export default monitorQueue;