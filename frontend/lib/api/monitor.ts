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

export const getMonitorByIdApi = async (monitorId: string): Promise<ApiResponse<Monitor>> => {
    const response = await apiClient
        .get<ApiResponse<Monitor>>(`/monitors/${monitorId}`);
    return response.data;
};

export const toggleMonitorStatusApi = async (
    monitorId: string,
    isActive: boolean
): Promise<ApiResponse<null>> => {
    const response = await apiClient
        .patch<ApiResponse<null>>(`/monitors/${monitorId}/status`, { isActive });
    return response.data;
};

export const deleteMonitorApi = async (
    monitorId: string
): Promise<ApiResponse<null>> => {
    const response = await apiClient
        .delete<ApiResponse<null>>(`/monitors/${monitorId}`);
    return response.data;
};

export const updateMonitorApi = async (
    monitorId: string,
    payload: { url?: string; interval?: number }
): Promise<ApiResponse<Monitor>> => {
    const response = await apiClient
        .patch<ApiResponse<Monitor>>(`/monitors/${monitorId}`, payload);
    return response.data;
};