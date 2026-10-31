import { useQuery } from "@tanstack/react-query";
import { getMonitorChartApi } from "@/lib/api/monitor";
import type { ChartData, Duration } from "@/lib/types";

export const useGetMonitorChartData = (
    monitorId: string,
    range: Duration
) => {
    return useQuery<ChartData, Error>({
        queryKey: ["monitor", monitorId, "chart", range],

        queryFn: async () => {
            const response = await getMonitorChartApi(monitorId, range);

            if (!response.success || response.data === null) {
                throw new Error(
                    response.message || "Failed to fetch monitor chart data"
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