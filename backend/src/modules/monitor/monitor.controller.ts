import { asyncHandler } from "../../utils/asyncHandler.js";
import { createMonitorService, getMonitorsService } from "./monitor.service.js";
import { CustomError } from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";

const createMonitor = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new CustomError(401, "Unauthorized!");

    const { url, interval } = req.body;

    const monitor = await createMonitorService(url, interval, userId);

    return res.status(201).json(
        new ApiResponse(
            201,
            "Monitor created successfully",
            monitor
        )
    )
})

const getMonitors = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new CustomError(401, "Unauthorized!");
     const monitors = await getMonitorsService(userId);

    return res.status(201).json(
        new ApiResponse(
            200,
            "Monitors fetched successfully",
            monitors
        )
    )
})

export {
    createMonitor,
    getMonitors
}