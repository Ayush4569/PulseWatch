import { useQuery } from "@tanstack/react-query";
import { getMonitorChecksApi } from "@/lib/api/monitor";
import type { MonitorChecksResponse } from "@/lib/types";

export const useMonitorChecks = (
    monitorId: string,
    page: number,
    limit = 10
) => {
    return useQuery<MonitorChecksResponse, Error>({
        queryKey: ["monitor", monitorId, "checks", page, limit],

        queryFn: async () => {
            const response = await getMonitorChecksApi(
                monitorId,
                page,
                limit
            );

            if (!response.success || response.data === null) {
                throw new Error(
                    response.message || "Failed to fetch monitor checks"
                );
            }

            return response.data;
        },

        enabled: Boolean(monitorId),
        placeholderData: (previousData) => previousData,
    });
};