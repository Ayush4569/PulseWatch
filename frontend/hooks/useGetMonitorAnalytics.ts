import { useQuery } from "@tanstack/react-query";
import { getMonitorAnalyticsApi } from "@/lib/api/monitor";
import type { MonitorAnalytics } from "@/lib/types";

export const useMonitorAnalytics = (monitorId: string) => {
    return useQuery<MonitorAnalytics, Error>({
        queryKey: ["monitor", monitorId, "analytics"],

        queryFn: async () => {
            const response = await getMonitorAnalyticsApi(monitorId);

            if (!response.success || response.data === null) {
                throw new Error(
                    response.message || "Failed to fetch monitor analytics"
                );
            }

            return response.data;
        },

        enabled: Boolean(monitorId),
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
    });
};