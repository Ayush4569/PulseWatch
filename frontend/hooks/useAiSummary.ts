import { getDashboardAiSummaryApi } from "@/lib/api/analytics";
import type { DashboardAiSummary } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

const fetchAiSummary = async (): Promise<DashboardAiSummary> => {
  const response = await getDashboardAiSummaryApi();

  if (!response.success || response.data === null) {
    throw new Error(
      response.message || "Failed to generate AI telemetry summary"
    );
  }

  return response.data;
};

export const useAiSummary = () => {
  return useQuery<DashboardAiSummary, Error>({
    queryKey: ["ai-dashboard-summary"],
    queryFn: fetchAiSummary,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute fresh cache
  });
};
