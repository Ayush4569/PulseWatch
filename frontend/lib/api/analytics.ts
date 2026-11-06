import type { ApiResponse, DashboardAiSummary } from "../types";
import { apiClient } from "./client";

export const getDashboardAiSummaryApi = async (): Promise<
  ApiResponse<DashboardAiSummary>
> => {
  const response = await apiClient.get<ApiResponse<DashboardAiSummary>>(
    "/analytics/dashboard-summary"
  );
  return response.data;
};
