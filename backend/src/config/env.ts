import "dotenv/config";
import z from "zod";


const envSchema = z.object({
    PORT: z.coerce.number().positive().default(8000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string({ error: "DB URL ABSENT!" }),
    JWT_SECRET: z.string().min(10, { error: "JWT SECRET IS TOO SHORT!" }),
    JWT_REFRESH_SECRET: z.string().min(10, { error: "JWT_REFRESH_SECRET IS TOO SHORT!" }),
    ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
    REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
    REDIS_URL: z.string({ error: "REDIS URL ABSENT!" }),
    GEMINI_API_KEY: z.string(),
    PRIMARY_GEMINI_MODEL: z.string(),
    SECONDARY_GEMINI_MODEL: z.string(),
})

export const config = envSchema.parse(process.env);