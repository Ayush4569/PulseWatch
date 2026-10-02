import { Queue } from "bullmq";
import { config } from "../config/env.js";
export const connection = {
    host: new URL(config.REDIS_URL).hostname,
    port: Number(new URL(config.REDIS_URL).port) || 6379,
    maxRetriesPerRequest: null,
}
const monitorQueue = new Queue("Monitors",{connection});
export default monitorQueue;