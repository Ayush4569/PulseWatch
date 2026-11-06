import { randomUUID, randomBytes } from "node:crypto";
import pool from "../../db/client.js";
import { CustomError } from "../../utils/apiError.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../utils/token.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";

export interface UserResponse {
    id: string;
    username: string;
    email: string;
    isGuest?: boolean;
    createdAt: Date;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export const createGuestSessionService = async (): Promise<{
    user: UserResponse;
    tokens: AuthTokens;
}> => {
    const client = await pool.connect();
    try {
        const guestUuid = randomUUID();
        const shortHex = randomBytes(8).toString("hex");
        const guestUsername = `Guest-${shortHex}`;
        const guestEmail = `guest_${shortHex}@pulsewatch.guest`;

        const insertResult = await client.query(
            `INSERT INTO users (id, username, email, password_hash, is_guest)
             VALUES ($1, $2, $3, NULL, TRUE)
             RETURNING id, username, email, is_guest as "isGuest", created_at as "createdAt"`,
            [guestUuid, guestUsername, guestEmail]
        );

        const user: UserResponse = insertResult.rows[0];

        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            username: user.username,
            isGuest: true,
        });
        const refreshToken = generateRefreshToken({ id: user.id });

        const refreshTokenHash = await hashPassword(refreshToken);
        await client.query(
            "UPDATE users SET refresh_token_hash = $1, updated_at = NOW() WHERE id = $2",
            [refreshTokenHash, user.id]
        );

        return {
            user,
            tokens: { accessToken, refreshToken },
        };
    } finally {
        client.release();
    }
};

export const registerUserService = async (
    input: RegisterInput,
    guestUserId?: string
): Promise<{ user: UserResponse; tokens: AuthTokens }> => {
    const client = await pool.connect();
    try {
       
        if (guestUserId) {
            const guestCheck = await client.query(
                "SELECT id, is_guest FROM users WHERE id = $1",
                [guestUserId]
            );

            if (guestCheck.rows.length > 0 && guestCheck.rows[0].is_guest) {
                const emailCheck = await client.query(
                    "SELECT id FROM users WHERE email = $1 AND id != $2",
                    [input.email, guestUserId]
                );
                if (emailCheck.rows.length > 0) {
                    throw new CustomError(400, "User with this email already exists");
                }

                const passwordHash = await hashPassword(input.password);

                const updateResult = await client.query(
                    `UPDATE users
                     SET username = $1, email = $2, password_hash = $3, is_guest = FALSE, updated_at = NOW()
                     WHERE id = $4
                     RETURNING id, username, email, is_guest as "isGuest", created_at as "createdAt"`,
                    [input.username, input.email, passwordHash, guestUserId]
                );

                const user: UserResponse = updateResult.rows[0];

                const accessToken = generateAccessToken({
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    isGuest: false,
                });
                const refreshToken = generateRefreshToken({ id: user.id });

                const refreshTokenHash = await hashPassword(refreshToken);
                await client.query(
                    "UPDATE users SET refresh_token_hash = $1, updated_at = NOW() WHERE id = $2",
                    [refreshTokenHash, user.id]
                );

                return {
                    user,
                    tokens: { accessToken, refreshToken },
                };
            }
        }

        const existingResult = await client.query(
            "SELECT id FROM users WHERE email = $1",
            [input.email]
        );
        if (existingResult.rows.length > 0) {
            throw new CustomError(400, "User with this email already exists");
        }

        const passwordHash = await hashPassword(input.password);

        const insertResult = await client.query(
            `INSERT INTO users (username, email, password_hash, is_guest)
             VALUES ($1, $2, $3, FALSE)
             RETURNING id, username, email, is_guest as "isGuest", created_at as "createdAt"`,
            [input.username, input.email, passwordHash]
        );

        const user: UserResponse = insertResult.rows[0];

        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            username: user.username,
            isGuest: false,
        });
        const refreshToken = generateRefreshToken({ id: user.id });

        const refreshTokenHash = await hashPassword(refreshToken);
        await client.query(
            "UPDATE users SET refresh_token_hash = $1, updated_at = NOW() WHERE id = $2",
            [refreshTokenHash, user.id]
        );

        return {
            user,
            tokens: { accessToken, refreshToken },
        };
    } finally {
        client.release();
    }
};

export const loginUserService = async (
    input: LoginInput
): Promise<{ user: UserResponse; tokens: AuthTokens }> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            "SELECT id, username, email, password_hash, is_guest, created_at FROM users WHERE email = $1",
            [input.email]
        );

        if (result.rows.length === 0) {
            throw new CustomError(400, "Invalid email or password");
        }

        const dbUser = result.rows[0];
        if (!dbUser.password_hash) {
            throw new CustomError(400, "Invalid email or password");
        }

        const isPasswordValid = await comparePassword(
            input.password,
            dbUser.password_hash
        );

        if (!isPasswordValid) {
            throw new CustomError(400, "Invalid email or password");
        }

        const user: UserResponse = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            isGuest: !!dbUser.is_guest,
            createdAt: dbUser.created_at,
        };

        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            username: user.username,
            isGuest: !!dbUser.is_guest,
        });
        const refreshToken = generateRefreshToken({ id: user.id });

        const refreshTokenHash = await hashPassword(refreshToken);
        await client.query(
            "UPDATE users SET refresh_token_hash = $1, updated_at = NOW() WHERE id = $2",
            [refreshTokenHash, user.id]
        );

        return {
            user,
            tokens: { accessToken, refreshToken },
        };
    } finally {
        client.release();
    }
};

export const logoutUserService = async (userId: string): Promise<void> => {
    const client = await pool.connect();
    try {
        await client.query(
            "UPDATE users SET refresh_token_hash = NULL, updated_at = NOW() WHERE id = $1",
            [userId]
        );
    } finally {
        client.release();
    }
};

export const refreshTokensService = async (
    refreshTokenInput: string
): Promise<{ user: UserResponse; tokens: AuthTokens }> => {
    if (!refreshTokenInput) {
        throw new CustomError(401, "Refresh token is missing");
    }

    let decoded;
    try {
        decoded = verifyRefreshToken(refreshTokenInput);
    } catch {
        throw new CustomError(401, "Invalid or expired refresh token");
    }

    const client = await pool.connect();
    try {
        const result = await client.query(
            "SELECT id, username, email, is_guest, refresh_token_hash, created_at FROM users WHERE id = $1",
            [decoded.id]
        );

        if (result.rows.length === 0) {
            throw new CustomError(401, "User not found");
        }

        const dbUser = result.rows[0];
        if (!dbUser.refresh_token_hash) {
            throw new CustomError(401, "Refresh token invalidated or reused");
        }

        const isMatch = await comparePassword(
            refreshTokenInput,
            dbUser.refresh_token_hash
        );
        if (!isMatch) {
            // Potential token reuse detected! Clear stored refresh token for security.
            await client.query(
                "UPDATE users SET refresh_token_hash = NULL, updated_at = NOW() WHERE id = $1",
                [dbUser.id]
            );
            throw new CustomError(401, "Invalid refresh token");
        }

        const user: UserResponse = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            isGuest: !!dbUser.is_guest,
            createdAt: dbUser.created_at,
        };

        // Issue new tokens (Refresh Token Rotation)
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            username: user.username,
            isGuest: !!dbUser.is_guest,
        });
        const newRefreshToken = generateRefreshToken({ id: user.id });

        const newRefreshTokenHash = await hashPassword(newRefreshToken);
        await client.query(
            "UPDATE users SET refresh_token_hash = $1, updated_at = NOW() WHERE id = $2",
            [newRefreshTokenHash, user.id]
        );

        return {
            user,
            tokens: { accessToken, refreshToken: newRefreshToken },
        };
    } finally {
        client.release();
    }
};

export const getUserProfileService = async (
    userId: string
): Promise<UserResponse> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT id, username, email, is_guest as "isGuest", created_at as "createdAt" FROM users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            throw new CustomError(404, "User not found");
        }

        return result.rows[0];
    } finally {
        client.release();
    }
};
