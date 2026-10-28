import type { ApiResponse, CreateMonitor, Monitor } from "../types";
import { apiClient } from "./client"

interface CreateMonitorPayload {
    interval: number;
    url: string
}

export const createMonitorApi = async ({ interval, url }: CreateMonitorPayload): Promise<ApiResponse<CreateMonitor>> => {
    const response = await apiClient.post<ApiResponse<CreateMonitor>>("/monitors/create", { interval, url });
    return response.data;
}

export const getMonitorsApi = async (): Promise<ApiResponse<Monitor[]>> => {
    const response = await apiClient.get<ApiResponse<Monitor[]>>("/monitors");
    return response.data
}
