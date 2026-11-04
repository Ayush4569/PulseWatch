import { useQuery } from "@tanstack/react-query";
import { getIncidentsApi, type GetIncidentsParams } from "@/lib/api/incidents";
import type { IncidentsResponse } from "@/lib/types";

export const useIncidents = (params: GetIncidentsParams = {}) => {
  const { page = 1, limit = 20, status } = params;

  return useQuery<IncidentsResponse, Error>({
    queryKey: ["incidents", { page, limit, status }],
    queryFn: async () => {
      const response = await getIncidentsApi({ page, limit, status });
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch incidents");
      }
      return response.data;
    },
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};
