import { useQuery } from "@tanstack/react-query";
import { getMonitorByIdApi } from "@/lib/api/monitor";
import type { Monitor } from "@/lib/types";

export const useMonitorDetails = (monitorId: string) => {
  return useQuery<Monitor, Error>({
    queryKey: ["monitor", monitorId, "details"],
    queryFn: async () => {
      const response = await getMonitorByIdApi(monitorId);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch monitor details");
      }
      return response.data;
    },
    enabled: Boolean(monitorId),
    refetchOnWindowFocus: false,
  });
};
