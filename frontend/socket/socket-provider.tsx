import { io, Socket } from "socket.io-client"
import { useEffect, useRef, type ReactNode } from "react";
import { useAuthContext } from "@/context/auth-context";
import { getAccessToken, subscribeToTokenChanges, } from "@/lib/api/client";
import { MonitorCheckEvent, SOCKET_EVENTS } from "@/lib/types";
export function SocketProvider({ children }: { children: ReactNode }) {
     const { isAuthenticated, loading } = useAuthContext();
     const socketRef = useRef<Socket | null>(null);

     useEffect(() => {
          if (loading) return;
          if (!isAuthenticated) {
               socketRef.current?.disconnect();
               socketRef.current = null;
               return;
          }
          const token = getAccessToken();
          if (!token) {
               console.error("Cannot connect socket: access token unavailable");
               return;
          }
          const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
               auth: { token },
               autoConnect: false,
               reconnection: true,
               reconnectionAttempts: Infinity,
               reconnectionDelay: 1000,
               reconnectionDelayMax: 5000,
               timeout: 10000,
          })
          socketRef.current = socket;

          socket.on("connect", () => {
               console.log("Socket connected:", socket.id);
          });

          socket.on("disconnect", (reason) => {
               console.log("Socket disconnected:", reason);
          });

          socket.on("connect_error", (error) => {
               console.error("Socket connection error:", error.message);
          });
          const unsubscribe = subscribeToTokenChanges((newToken) => {
               if (!newToken) {
                    socket.disconnect();
                    return;
               }

               // Update credentials used for the next handshake.
               socket.auth = { token: newToken };

               // Force a new handshake with the updated token.
               if (socket.connected) {
                    socket.disconnect();
               }

               socket.connect();
          });
          const handleMonitorCheck = (event:MonitorCheckEvent)=> {
           
          }
          socket.on(SOCKET_EVENTS['MONITOR_CHECK'],handleMonitorCheck)
          socket.connect();

          return () => {
               unsubscribe();
               socket.removeAllListeners();
               socket.disconnect();
               if (socketRef.current === socket) {
                    socketRef.current = null;
               }
          }
     }, [isAuthenticated, loading])


     return <>{children}</>;
}