"use client";

import { io, Socket } from "socket.io-client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuthContext } from "@/context/auth-context";
import { getAccessToken, subscribeToTokenChanges } from "@/lib/api/client";
import {
  IncidentCreatedEvent,
  IncidentResolvedEvent,
  Monitor,
  MonitorCheckEvent,
  SOCKET_EVENTS,
} from "@/lib/types";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

export type SocketStatus = "connected" | "connecting" | "disconnected";

export interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  status: SocketStatus;
  liveChecks: MonitorCheckEvent[];
  clearLiveChecks: () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

const MAX_LIVE_CHECKS = 50;

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuthContext();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const [liveChecks, setLiveChecks] = useState<MonitorCheckEvent[]>([]);

  const clearLiveChecks = useCallback(() => {
    setLiveChecks([]);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSocket((prevSocket) => {
        prevSocket?.disconnect();
        return null;
      });
      setStatus("disconnected");
      setLiveChecks([]);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.warn("Cannot connect socket: access token not set");
      setStatus("disconnected");
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";
    setStatus("connecting");

    const newSocket = io(socketUrl, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setStatus("connected");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setStatus("disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setStatus("disconnected");
    });

    // Token refresh sync
    const unsubscribe = subscribeToTokenChanges((newToken) => {
      if (!newToken) {
        newSocket.disconnect();
        setStatus("disconnected");
        return;
      }
      newSocket.auth = { token: newToken };
      if (newSocket.connected) {
        newSocket.disconnect();
      }
      setStatus("connecting");
      newSocket.connect();
    });

    const handleMonitorCheck = (event: MonitorCheckEvent) => {
      setLiveChecks((prev) => [event, ...prev.slice(0, MAX_LIVE_CHECKS - 1)]);
      queryClient.setQueryData<Monitor[]>(["monitors"], (old = []) => {
        return old.map((monitor) => {
          if (monitor.id !== event.monitorId) return monitor;
          return {
            ...monitor,
            lastStatus: event.success
              ? monitor.hasActiveIncident
                ? "DOWN"
                : "UP"
              : "DOWN",
            lastLatencyMs: event.latencyMs,
            lastCheckedAt: event.checkedAt,
            lastErrorMessage: event.errorMessage,
          };
        });
      });
      void queryClient.invalidateQueries({
        queryKey: ["monitor", event.monitorId, "analytics"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["monitor", event.monitorId, "checks"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["monitor", event.monitorId, "chart"],
      });
    };

    // Event Handler: INCIDENT_CREATED
    const handleIncidentCreated = (event: IncidentCreatedEvent) => {
      const currentMonitors =
        queryClient.getQueryData<Monitor[]>(["monitors"]) || [];
      const affectedMonitor = currentMonitors.find(
        (m) => m.id === event.monitorId
      );
      const monitorLabel =
        affectedMonitor?.url || `Monitor ${event.monitorId.slice(0, 8)}`;
      toast.error(`⚠️ Incident Detected: ${monitorLabel}`, {
        description: event.failureReason,
        duration: 8000,
      });
      queryClient.setQueryData<Monitor[]>(["monitors"], (old = []) => {
        return old.map((m) =>
          m.id === event.monitorId
            ? { ...m, hasActiveIncident: true, lastStatus: "DOWN" }
            : m
        );
      });
      void queryClient.invalidateQueries({ queryKey: ["incidents"] });
      void queryClient.invalidateQueries({
        queryKey: ["monitor", event.monitorId, "analytics"],
      });
    };

    const handleIncidentResolved = (event: IncidentResolvedEvent) => {
      const currentMonitors =
        queryClient.getQueryData<Monitor[]>(["monitors"]) || [];
      const affectedMonitor = currentMonitors.find(
        (m) => m.id === event.monitorId
      );
      const monitorLabel =
        affectedMonitor?.url || `Monitor ${event.monitorId.slice(0, 8)}`;
      toast.success(`✅ Incident Resolved: ${monitorLabel}`, {
        description: `Endpoint recovered at ${new Date(
          event.resolvedAt
        ).toLocaleTimeString()}`,
        duration: 6000,
      });
      queryClient.setQueryData<Monitor[]>(["monitors"], (old = []) => {
        return old.map((m) =>
          m.id === event.monitorId
            ? { ...m, hasActiveIncident: false, lastStatus: "UP" }
            : m
        );
      });
      void queryClient.invalidateQueries({ queryKey: ["incidents"] });
      void queryClient.invalidateQueries({
        queryKey: ["monitor", event.monitorId, "analytics"],
      });
    };

    newSocket.on(SOCKET_EVENTS.MONITOR_CHECK, handleMonitorCheck);
    newSocket.on(SOCKET_EVENTS.INCIDENT_CREATED, handleIncidentCreated);
    newSocket.on(SOCKET_EVENTS.INCIDENT_RESOLVED, handleIncidentResolved);
    newSocket.connect();

    return () => {
      unsubscribe();
      newSocket.off(SOCKET_EVENTS.MONITOR_CHECK, handleMonitorCheck);
      newSocket.off(SOCKET_EVENTS.INCIDENT_CREATED, handleIncidentCreated);
      newSocket.off(SOCKET_EVENTS.INCIDENT_RESOLVED, handleIncidentResolved);
      newSocket.removeAllListeners();
      newSocket.disconnect();
      setSocket(null);
      setStatus("disconnected");
    };
  }, [isAuthenticated, loading]);

  const value: SocketContextValue = {
    socket,
    isConnected: status === "connected",
    status,
    liveChecks,
    clearLiveChecks,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}