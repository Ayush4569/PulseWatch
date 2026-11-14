import { config } from "../config/env.js";
import { Redis } from "ioredis";

export const redisPublisher = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    keepAlive: 30000,
});

export const redisSubscriber = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    keepAlive: 30000,
});

redisPublisher.on("error", (err) => console.error("Redis publisher error:", err));
redisSubscriber.on("error", (err) => console.error("Redis subscriber error:", err));

