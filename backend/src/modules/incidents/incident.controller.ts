
import type { Request, Response } from "express";
import { CustomError } from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    getIncidentsService,
    getIncidentByIdService,
} from "./incident.service.js";

const getIncidents = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;

        if (!userId) throw new CustomError(401, "Unauthorized!");

        const pageValue = req.query.page ?? "1";
        const limitValue = req.query.limit ?? "20";
        const statusValue = req.query.status;

        if (
            typeof pageValue !== "string" ||
            !/^[1-9]\d*$/.test(pageValue)
        ) {
            throw new CustomError(400, "Page must be a positive integer");
        }

        if (
            typeof limitValue !== "string" ||
            !/^[1-9]\d*$/.test(limitValue)
        ) {
            throw new CustomError(400, "Limit must be a positive integer");
        }

        const page = Number(pageValue);
        const limit = Number(limitValue);

        if (!Number.isSafeInteger(page)) {
            throw new CustomError(400, "Invalid page value");
        }

        if (!Number.isSafeInteger(limit) || limit > 100) {
            throw new CustomError(400, "Limit must be between 1 and 100");
        }

        let status: "OPEN" | "RESOLVED" | undefined;

        if (statusValue !== undefined) {
            if (typeof statusValue !== "string") {
                throw new CustomError(400, "Invalid incident status");
            }

            const normalizedStatus = statusValue.toUpperCase();

            if (
                normalizedStatus !== "OPEN" &&
                normalizedStatus !== "RESOLVED"
            ) {
                throw new CustomError(
                    400,
                    "Status must be OPEN or RESOLVED"
                );
            }

            status = normalizedStatus;
        }

        const data = await getIncidentsService(userId, {
            page,
            limit,
            ...(status !== undefined && { status }),
        });

        return res
            .status(200)
            .json(new ApiResponse(200, "Incidents fetched successfully", data));
    }
);

const getIncidentById = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;

        if (!userId) throw new CustomError(401, "Unauthorized!");

        const { incidentId } = req.params as { incidentId: string };

        const incident = await getIncidentByIdService(
            userId,
            incidentId
        );

        res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Incident fetched successfully",
                    incident
                )
            );
    }
);

export { getIncidents, getIncidentById };
