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
redisPublisher.on("error", (err) => console.error("Redis publisher error:", err));
redisSubscriber.on("error", (err) => console.error("Redis subscriber error:", err));
export default redis