import { CustomError } from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getMonitorAnalytics } from "./analytics.service.js";
import { getDashboardAiSummaryService } from "./ai-summary.service.js";

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

const getDashboardAiSummary = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new CustomError(401, "Unauthorized!");
    }

    const summary = await getDashboardAiSummaryService(userId);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Dashboard AI summary generated successfully",
            summary
        )
    );
});

export {
    getSingleMonitorAnalytics,
    getDashboardAiSummary,
};
