import { config } from "../config/env.js";
import { Redis } from "ioredis";

const redis = new Redis(config.REDIS_URL)

redis.on("connect", () => {
    console.log("Redis connected!");
})

redis.on("error", (err) => {
    console.error("Redis connection error:", err);
})

export const redisPublisher = redis.duplicate();
export const redisSubscriber = redis.duplicate();
export default redis