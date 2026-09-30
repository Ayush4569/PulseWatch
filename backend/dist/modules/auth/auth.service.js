import pool from "../../db/client.js";
import { CustomError } from "../../utils/apiError.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, } from "../../utils/token.js";
export const registerUserService = async (input) => {
    const client = await pool.connect();
    try {
        // Check existing user
        const existingResult = await client.query("SELECT id FROM users WHERE email = $1", [input.email]);
        if (existingResult.rows.length > 0) {
            throw new CustomError(400, "User with this email already exists");
        }
        // Hash password
        const passwordHash = await hashPassword(input.password);
        // Insert user
        const insertResult = await client.query(`INSERT INTO users (username, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, username, email, created_at`, [input.username, input.email, passwordHash]);
        const user = insertResult.rows[0];
        // Generate tokens
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            username: user.username,
        });
        const refreshToken = generateRefreshToken({ id: user.id });
        // Hash refresh token & store in DB
        const refreshTokenHash = await hashPassword(refreshToken);
        await client.query("UPDATE users SET refresh_token_hash = $1, updated_at = NOW() WHERE id = $2", [refreshTokenHash, user.id]);
        return {
            user,
            tokens: { accessToken, refreshToken },
        };
    }
    finally {
        client.release();
    }
};
export const loginUserService = async (input) => {
    const client = await pool.connect();
    try {
        const result = await client.query("SELECT id, username, email, password_hash, created_at FROM users WHERE email = $1", [input.email]);
        if (result.rows.length === 0) {
            throw new CustomError(401, "Invalid email or password");
        }
        const dbUser = result.rows[0];
        const isPasswordValid = await comparePassword(input.password, dbUser.password_hash);
        if (!isPasswordValid) {
            throw new CustomError(401, "Invalid email or password");
        }
        const user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            created_at: dbUser.created_at,
        };
        // Generate tokens
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            username: user.username,
        });
        const refreshToken = generateRefreshToken({ id: user.id });
        // Hash refresh token & store in DB
        const refreshTokenHash = await hashPassword(refreshToken);
        await client.query("UPDATE users SET refresh_token_hash = $1, updated_at = NOW() WHERE id = $2", [refreshTokenHash, user.id]);
        return {
            user,
            tokens: { accessToken, refreshToken },
        };
    }
    finally {
        client.release();
    }
};
export const logoutUserService = async (userId) => {
    const client = await pool.connect();
    try {
        await client.query("UPDATE users SET refresh_token_hash = NULL, updated_at = NOW() WHERE id = $1", [userId]);
    }
    finally {
        client.release();
    }
};
export const refreshTokensService = async (refreshTokenInput) => {
    if (!refreshTokenInput) {
        throw new CustomError(401, "Refresh token is missing");
    }
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshTokenInput);
    }
    catch {
        throw new CustomError(401, "Invalid or expired refresh token");
    }
    const client = await pool.connect();
    try {
        const result = await client.query("SELECT id, username, email, refresh_token_hash, created_at FROM users WHERE id = $1", [decoded.id]);
        if (result.rows.length === 0) {
            throw new CustomError(401, "User not found");
        }
        const dbUser = result.rows[0];
        if (!dbUser.refresh_token_hash) {
            throw new CustomError(401, "Refresh token invalidated or reused");
        }
        const isMatch = await comparePassword(refreshTokenInput, dbUser.refresh_token_hash);
        if (!isMatch) {
            // Potential token reuse detected! Clear stored refresh token for security.
            await client.query("UPDATE users SET refresh_token_hash = NULL, updated_at = NOW() WHERE id = $1", [dbUser.id]);
            throw new CustomError(401, "Invalid refresh token");
        }
        const user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            created_at: dbUser.created_at,
        };
        // Issue new tokens (Refresh Token Rotation)
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            username: user.username,
        });
        const newRefreshToken = generateRefreshToken({ id: user.id });
        const newRefreshTokenHash = await hashPassword(newRefreshToken);
        await client.query("UPDATE users SET refresh_token_hash = $1, updated_at = NOW() WHERE id = $2", [newRefreshTokenHash, user.id]);
        return {
            user,
            tokens: { accessToken, refreshToken: newRefreshToken },
        };
    }
    finally {
        client.release();
    }
};
export const getUserProfileService = async (userId) => {
    const client = await pool.connect();
    try {
        const result = await client.query("SELECT id, username, email, created_at FROM users WHERE id = $1", [userId]);
        if (result.rows.length === 0) {
            throw new CustomError(404, "User not found");
        }
        return result.rows[0];
    }
    finally {
        client.release();
    }
};
