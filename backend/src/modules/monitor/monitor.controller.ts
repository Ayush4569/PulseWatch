import { asyncHandler } from "../../utils/asyncHandler.js";
import { createMonitorService, deleteMonitorService, getMonitorDetailsService, getMonitorsService, toggleMonitorStatusService, updateMontiorService } from "./monitor.service.js";
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

    return res.status(200).json(
        new ApiResponse(
            200,
            "Monitors fetched successfully",
            monitors
        )
    )
})

const getMonitorById = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new CustomError(401, "Unauthorized!");
    const { monitorId } = req.params as { monitorId: string };
    const monitorData = await getMonitorDetailsService(userId, monitorId);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Monitor details fetched",
            monitorData
        )
    )

})

const updateMontiorConfig = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new CustomError(401, "Unauthorized!");

    const { monitorId } = req.params as { monitorId: string };
    const { url, interval } = req.body;

    const updatedMonitor = await updateMontiorService({url, interval}, userId, monitorId);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Monitor updated successfully",
            updatedMonitor
        )
    )
})
const deleteMonitor = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new CustomError(401, "Unauthorized!");

    const { monitorId } = req.params as { monitorId: string };

    await deleteMonitorService(userId,monitorId);

    return res.status(200).json(
        new ApiResponse(
            201,
            "Monitor deleted successfully",
            null
        )
    )
})
const toggleStatus = asyncHandler(async(req,res)=> {
    const userId = req.user?.id;
    if (!userId) throw new CustomError(401, "Unauthorized!");

    const { monitorId } = req.params as { monitorId: string };
    const {isActive} = req.body;

    if(typeof isActive != 'boolean') {
        throw new CustomError(400, "isActive must be a boolean");
    }

    await toggleMonitorStatusService(userId,monitorId,isActive);

    return res.status(200).json(
        new ApiResponse(
            201,
            "Monitor toggled successfully",
            null
        )
    ) 

})
export {
    createMonitor,
    getMonitors,
    getMonitorById,
    updateMontiorConfig,
    deleteMonitor,
    toggleStatus
}