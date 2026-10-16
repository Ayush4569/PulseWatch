import { CustomError } from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getMonitorCheckService, getMonitorCheckSeriesService } from "./checks.service.js";
import { rangeSchema } from "./checks.validation.js";

const getMonitorChecks = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new CustomError(401, "Unauthorized!")

    const { monitorId } = req.params as { monitorId: string };

    const pageValue = req.query.page ?? "1";
    const limitValue = req.query.limit ?? "20";

    if (typeof pageValue !== "string" || typeof limitValue !== "string") {
        throw new CustomError(400, "Invalid parameters");
    }

    const page = Number(pageValue);
    const limit = Number(limitValue);

    if (!Number.isInteger(page) || page < 1) {
        throw new CustomError(400, "Page must be a positive integer");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new CustomError(400, "Limit must be between 1 and 100");
    }

    const { ...result } = await getMonitorCheckService(monitorId, userId, page, limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Monitor checks fetched",
            result
        )
    )

})

const getMonitorCheckSeries = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new CustomError(401, "Unauthorized!")

    const { monitorId } = req.params as { monitorId: string };

    const range = (req.body.range ) ?? "1h";

    const valid = rangeSchema.safeParse(range);

    if(!valid.success) {
        throw new CustomError(401, "In-correct range!")
    }

    const { ...result } = await getMonitorCheckSeriesService(monitorId, userId, valid.data.range);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Monitor checks fetched",
            result
        )
    )
})

export {
    getMonitorChecks,
    getMonitorCheckSeries
}