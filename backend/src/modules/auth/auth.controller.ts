import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { CustomError } from "../../utils/apiError.js";
import {
    getAccessCookieOptions,
    getRefreshCookieOptions,
    getClearCookieOptions,
} from "../../utils/token.js";
import {
    registerUserService,
    loginUserService,
    logoutUserService,
    refreshTokensService,
    getUserProfileService,
} from "./auth.service.js";

export const registerController = asyncHandler(
    async (req: Request, res: Response) => {
        const { user, tokens } = await registerUserService(req.body);

        res.cookie("accessToken", tokens.accessToken, getAccessCookieOptions());
        res.cookie("refreshToken", tokens.refreshToken, getRefreshCookieOptions());

        return res.status(201).json(
            new ApiResponse(201, "User registered successfully", {
                user,
                accessToken: tokens.accessToken,
            })
        );
    }
);

export const loginController = asyncHandler(
    async (req: Request, res: Response) => {
        const { user, tokens } = await loginUserService(req.body);

        res.cookie("accessToken", tokens.accessToken, getAccessCookieOptions());
        res.cookie("refreshToken", tokens.refreshToken, getRefreshCookieOptions());

        return res.status(200).json(
            new ApiResponse(200, "Login successful", {
                user,
                accessToken: tokens.accessToken,
            })
        );
    }
);

export const logoutController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (userId) {
            await logoutUserService(userId);
        }

        res.cookie("accessToken", "", getClearCookieOptions());
        res.cookie("refreshToken", "", getClearCookieOptions());

        return res
            .status(200)
            .json(new ApiResponse(200, "Logged out successfully", null));
    }
);

export const refreshTokenController = asyncHandler(
    async (req: Request, res: Response) => {
        const refreshToken =
            req.cookies?.refreshToken || req.body?.refreshToken;

        if (!refreshToken) {
            throw new CustomError(401, "Refresh token is missing");
        }

        const { user, tokens } = await refreshTokensService(refreshToken);

        res.cookie("accessToken", tokens.accessToken, getAccessCookieOptions());
        res.cookie("refreshToken", tokens.refreshToken, getRefreshCookieOptions());

        return res.status(200).json(
            new ApiResponse(200, "Token refreshed successfully", {
                user,
                accessToken: tokens.accessToken,
            })
        );
    }
);

export const meController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new CustomError(401, "Unauthorized");
        }

        const user = await getUserProfileService(userId);

        return res
            .status(200)
            .json(new ApiResponse(200, "User profile retrieved successfully", user));
    }
);
