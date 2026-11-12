import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMonitorApi, toggleMonitorStatusApi } from "@/lib/api/monitor";
import type { Monitor } from "@/lib/types";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";

export const useToggleMonitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      monitorId,
      isActive,
    }: {
      monitorId: string;
      isActive: boolean;
    }) => {
      const response = await toggleMonitorStatusApi(monitorId, isActive);
      if (!response.success) {
        throw new Error(response.message || "Failed to update monitor status");
      }
      return { monitorId, isActive };
    },
    onMutate: async ({ monitorId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ["monitors"] });
      await queryClient.cancelQueries({ queryKey: ["monitor", monitorId, "details"] });

      const previousMonitors = queryClient.getQueryData<Monitor[]>(["monitors"]);
      const previousDetails = queryClient.getQueryData<Monitor>(["monitor", monitorId, "details"]);

      queryClient.setQueryData<Monitor[]>(["monitors"], (old = []) =>
        old.map((m) => (m.id === monitorId ? { ...m, isActive } : m))
      );

      if (previousDetails) {
        queryClient.setQueryData<Monitor>(["monitor", monitorId, "details"], {
          ...previousDetails,
          isActive,
        });
      }

      return { previousMonitors, previousDetails };
    },
    onError: (err, variables, context) => {
      if (context?.previousMonitors) {
        queryClient.setQueryData(["monitors"], context.previousMonitors);
      }
      if (context?.previousDetails) {
        queryClient.setQueryData(
          ["monitor", variables.monitorId, "details"],
          context.previousDetails
        );
      }
      toast.error("Failed to change monitor status", {
        description: getApiErrorMessage(err),
      });
    },
    onSuccess: ({ monitorId, isActive }) => {
      toast.success(isActive ? "Monitor resumed" : "Monitor paused");
      void queryClient.invalidateQueries({ queryKey: ["monitors"] });
      void queryClient.invalidateQueries({
        queryKey: ["monitor", monitorId, "details"],
      });
    },
  });
};

export const useDeleteMonitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (monitorId: string) => {
      const response = await deleteMonitorApi(monitorId);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete monitor");
      }
      return monitorId;
    },
    onMutate: async (monitorId) => {
      await queryClient.cancelQueries({ queryKey: ["monitors"] });
      await queryClient.cancelQueries({ queryKey: ["monitor", monitorId, "details"] });

      const previousMonitors = queryClient.getQueryData<Monitor[]>(["monitors"]);

      queryClient.setQueryData<Monitor[]>(["monitors"], (old = []) =>
        old.filter((m) => m.id !== monitorId)
      );

      // Immediately notify SocketProvider to purge live checks for this monitor
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("monitor:deleted", { detail: { monitorId } })
        );
      }

      return { previousMonitors };
    },
    onError: (err, _variables, context) => {
      if (context?.previousMonitors) {
        queryClient.setQueryData(["monitors"], context.previousMonitors);
      }
      toast.error("Failed to delete monitor", {
        description: getApiErrorMessage(err),
      });
    },
    onSuccess: (monitorId) => {
      toast.success("Monitor deleted successfully");
      void queryClient.invalidateQueries({ queryKey: ["monitors"] });
      void queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.removeQueries({ queryKey: ["monitor", monitorId] });
    },
  });
};
