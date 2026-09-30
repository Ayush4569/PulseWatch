import z from "zod";
export const registerSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username cannot exceed 20 characters")
        .trim(),
    email: z
        .string()
        .email("Invalid email address")
        .trim()
        .toLowerCase(),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});
export const loginSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .trim()
        .toLowerCase(),
    password: z
        .string()
        .min(1, "Password is required"),
});
export const refreshTokenSchema = z.object({
    refreshToken: z.string().optional(),
});
