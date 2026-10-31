
import { getMonitorsApi } from "@/lib/api/monitor";
import type { Monitor } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

const fetchMonitors = async (): Promise<Monitor[]> => {
  const response = await getMonitorsApi();

  if (!response.success || response.data === null) {
    throw new Error(
      response.message || "Failed to fetch monitors"
    );
  }

  return response.data;
};

export const useMonitors = () => {
  return useQuery<Monitor[], Error>({
    queryKey: ["monitors"],
    queryFn: fetchMonitors,
    refetchOnWindowFocus: false,
  });
};
