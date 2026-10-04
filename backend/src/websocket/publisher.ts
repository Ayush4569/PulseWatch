import { redisPublisher } from "../config/redis.js";
import {
    SOCKET_EVENTS,
    type MonitorCheckPayload,
    type IncidentCreatedPayload,
    type IncidentResolvedPayload
} from "./events.js";

export const EVENT_CHANNEL = "monitor-events";

export const publishMonitorCheck = async (
    userId: string,
    data: MonitorCheckPayload
) => {
    await redisPublisher.publish(
        EVENT_CHANNEL,
        JSON.stringify({
            type: SOCKET_EVENTS.MONITOR_CHECK,
            userId,
            data
        })
    );
};

export const publishIncidentCreated = async (
    userId: string,
    data: IncidentCreatedPayload
) => {
    await redisPublisher.publish(
        EVENT_CHANNEL,
        JSON.stringify({
            type: SOCKET_EVENTS.INCIDENT_CREATED,
            userId,
            data
        })
    );
};

export const publishIncidentResolved = async (
    userId: string,
    data: IncidentResolvedPayload
) => {
    await redisPublisher.publish(
        EVENT_CHANNEL,
        JSON.stringify({
            type: SOCKET_EVENTS.INCIDENT_RESOLVED,
            userId,
            data
        })
    );
};