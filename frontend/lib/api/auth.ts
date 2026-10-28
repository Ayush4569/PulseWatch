import type { ApiResponse, AuthResponseData, User } from "../types";
import { apiClient } from "./client"

interface RegisterInput {
    username: string,
    email: string,
    password: string
}

export const registerApi = async (registerInput: RegisterInput): Promise<ApiResponse<AuthResponseData>> => {
    const response = await apiClient
        .post<ApiResponse<AuthResponseData>>
        ("/auth/register", registerInput);
    return response.data
}


export const loginApi = async (loginInput: Pick<RegisterInput, 'email' | 'password'>):
    Promise<ApiResponse<AuthResponseData>> => {
    const response = await apiClient
        .post<ApiResponse<AuthResponseData>>
        ("/auth/login", loginInput);
    return response.data
}

export const logoutApi = async (): Promise<ApiResponse<null>> => {
    const response = await apiClient
        .post<ApiResponse<null>>
        ("/auth/logout");
    return response.data
}

export const getProfileApi = async (): Promise<ApiResponse<User>> => {
    const response = await apiClient
        .get<ApiResponse<User>>
        ("/auth/profile");
    return response.data
}

