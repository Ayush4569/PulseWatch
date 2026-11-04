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
};
const monitorQueue = new Queue("Monitors",{connection});
export default monitorQueue;