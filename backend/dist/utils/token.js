import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.ACCESS_TOKEN_EXPIRY,
    });
};
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
        expiresIn: config.REFRESH_TOKEN_EXPIRY,
    });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, config.JWT_SECRET);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
export const getAccessCookieOptions = () => ({
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 minutes
});
export const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
export const getClearCookieOptions = () => ({
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
});
