import type { ApiResponse, IncidentItem, IncidentsResponse } from "../types";
import { apiClient } from "./client";

export interface GetIncidentsParams {
  page?: number;
  limit?: number;
  status?: "OPEN" | "RESOLVED";
}

export const getIncidentsApi = async ({
  page = 1,
  limit = 20,
  status,
}: GetIncidentsParams = {}): Promise<ApiResponse<IncidentsResponse>> => {
  const params: Record<string, string | number> = { page, limit };
  if (status) {
    params.status = status;
  }

  const response = await apiClient.get<ApiResponse<IncidentsResponse>>("/incidents", {
    params,
  });
  return response.data;
};

export const getIncidentByIdApi = async (
  incidentId: string
): Promise<ApiResponse<IncidentItem>> => {
  const response = await apiClient.get<ApiResponse<IncidentItem>>(
    `/incidents/${incidentId}`
  );
  return response.data;
};
