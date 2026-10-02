import { CustomError } from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getAllMonitorsAnalytics, getMonitorAnalytics } from "./analytics.service.js";

const getAllAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new CustomError(401, "Unauthorized!");
    }

    const analytics = await getAllMonitorsAnalytics(userId);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Analytics fetched successfully",
            analytics
        )
    );
});

const getSingleMonitorAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new CustomError(401, "Unauthorized!");
    }

    const { monitorId } = req.params;

    const analytics = await getMonitorAnalytics(
        monitorId as string,
        userId
    );

    if (!analytics) {
        throw new CustomError(404, "Monitor not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Monitor analytics fetched successfully",
            analytics
        )
    );
});

export {
    getAllAnalytics,
    getSingleMonitorAnalytics
}