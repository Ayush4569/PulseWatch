import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";
import { config } from "../config/env.js";

export interface AccessTokenPayload {
    id: string;
    email: string;
    username: string;
    isGuest?: boolean;
}

export interface RefreshTokenPayload {
    id: string;
}

export const generateAccessToken = (payload: AccessTokenPayload): string => {
    return jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.ACCESS_TOKEN_EXPIRY,
    } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
        expiresIn: config.REFRESH_TOKEN_EXPIRY,
    } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
    return jwt.verify(token, config.JWT_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};

const isProduction = config.NODE_ENV === "production";

export const getAccessCookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 minutes
});

export const getRefreshCookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const getClearCookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 0,
});
