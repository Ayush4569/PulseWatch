import type { ApiResponse, AuthResponseData, User } from "../types";
import { apiClient } from "./client"

interface RegisterInput {
    username: string,
    email: string,
    password: string
}

export const registerApi = async (registerInput: RegisterInput) => {
    const response = await apiClient
        .post<ApiResponse<AuthResponseData>>
        ("/auth/register", registerInput);
    return response.data
}


export const loginApi = async (loginInput: Pick<RegisterInput, 'email' | 'password'>) => {
    const response = await apiClient
        .post<ApiResponse<AuthResponseData>>
        ("/auth/login", loginInput);
    return response.data
}

export const logoutApi = async () => {
    const response = await apiClient
        .post<ApiResponse<null>>
        ("/auth/logout");
    return response.data
}

export const getProfileApi = async () => {
    const response = await apiClient
        .post<ApiResponse<User>>
        ("/auth/profile");
    return response.data
}

