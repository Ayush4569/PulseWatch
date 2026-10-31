import type { ApiResponse, ChartData, CreateMonitor, Monitor, MonitorAnalytics, MonitorChecksResponse } from "../types";
import { apiClient } from "./client"

interface CreateMonitorPayload {
    interval: number;
    url: string
}

export const createMonitorApi = async ({ interval, url }: CreateMonitorPayload): Promise<ApiResponse<CreateMonitor>> => {
    const response = await apiClient
        .post<ApiResponse<CreateMonitor>>("/monitors/create", { interval, url });
    return response.data;
}

export const getMonitorsApi = async (): Promise<ApiResponse<Monitor[]>> => {
    const response = await apiClient
        .get<ApiResponse<Monitor[]>>("/monitors");
    return response.data
}

export const getMonitorAnalyticsApi = async (id: string) => {
    const response = await apiClient
        .get<ApiResponse<MonitorAnalytics>>(`/analytics/monitors/${id}/overview`);
    return response.data;
}

export const getMonitorChartApi = async (id: string,range:string) => {
    const response = await apiClient
        .get<ApiResponse<ChartData>>(`/checks/monitors/${id}/series`,{
            params : {
                range
            }
        });
    return response.data;
}
export const getMonitorChecksApi = async (
    monitorId: string,
    page = 1,
    limit = 10
) => {
    const response = await apiClient
    .get<ApiResponse<MonitorChecksResponse>>(`/checks/monitors/${monitorId}`, {
        params: { page, limit },
    });

    return response.data;
};