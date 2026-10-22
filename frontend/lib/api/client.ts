import { toast } from "sonner";
import axios, {
    AxiosError,
    type AxiosInstance,
    type InternalAxiosRequestConfig,
} from "axios";
import { ApiResponse } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) throw new Error("BASE URL missing");

const REFRESH_ENDPOINT = "/auth/refresh-token";
const TIMEOUT = 10_000;


interface RefreshData {
    accessToken: string;
}
type RefreshResponse = ApiResponse<RefreshData>;

export interface ApiErrorBody {
    success?: false,
    message?: string,
    error?: string
}

let accessToken: string | null = null;
export const setAccessToken = (token: string | null): void => {
    accessToken = token;
}

declare module "axios" {
    interface InternalAxiosRequestConfig {
        _retry?: boolean;
        skipAuthRefresh?: boolean
    }
}

// for standard api request
export const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
})
// for refresh token request
export const refreshClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
})

// Request interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (accessToken) {
            config.headers.set(
                "Authorization",
                `Bearer ${accessToken}`
            )
        }
        else config.headers.delete("Authorization");
        return config;
    }
)
let refreshPromise: Promise<string> | null = null;
const refreshToken = async (): Promise<string> => {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                const result = await refreshClient.post<RefreshResponse>(
                    REFRESH_ENDPOINT
                );
                const newToken = result.data.data?.accessToken;

                if (!newToken || typeof newToken != "string") {
                    throw new Error(
                        "Refresh response did not contain an access token",
                    );
                }
                setAccessToken(newToken);
                return newToken;
            } catch (error) {
                setAccessToken(null);
                throw error;
            } finally {
                refreshPromise = null;
            }
        })()
    }
    return refreshPromise;
}

// response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorBody>) => {
        const originalRequest = error.config;

        if (
            error.response?.status != 401 ||
            !originalRequest ||
            originalRequest._retry ||
            originalRequest.skipAuthRefresh ||
            originalRequest.url == REFRESH_ENDPOINT
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;
        try {
            const newToken = await refreshToken();
            originalRequest.headers.set(
                "Authorization",
                `Bearer ${newToken}`
            )

            return apiClient.request(originalRequest)
        } catch (error) {
            toast.error("Your session has expired. Please log in again.");
            return Promise.reject(error);
        }
    }
)

export const getApiErrorMessage = (error: unknown):string => {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
        return (
            error.response?.data.message ??
            error.response?.data.error ??
            error.message ??
            "An unexpected API error occurred"
        )
    };

    if (error instanceof Error) {
        return error.message;
    }
    return "An unexpected error occurred";
}