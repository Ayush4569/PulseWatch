import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import type { User, AuthResponseData } from '@/lib/types'
import { setAccessToken } from '@/lib/api/client';
import { getProfileApi, loginApi, logoutApi, registerApi } from '@/lib/api/auth';

interface RegisterInput {
    username: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}
interface AuthContextValue {
    user: User | null,
    loading: boolean,
    isAuthenticated: boolean,
    login: (input: LoginInput) => Promise<void>,
    register: (input: RegisterInput) => Promise<void>,
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;

        const restoreSession = async () => {
            try {
                const response = await getProfileApi();
                if (!cancelled) {
                    setUser(response.data)
                }
            } catch (error) {
                if (!cancelled) {
                    setUser(null)
                    setAccessToken(null)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        void restoreSession();
        return () => {
            cancelled = true;
        }
    }, [])

    const login = async (input: LoginInput) => {
        const response = await loginApi(input);
        if (!response.data) {
            throw new Error("Login response is missing authentication data");
        }
        const authData = response.data;

        setUser(authData.user);
        setAccessToken(authData.accessToken)
    }

    const register = async (input: RegisterInput) => {
        const response = await registerApi(input);
         if (!response.data) {
            throw new Error("Register response is missing authentication data");
        }
        const authData = response.data;

        setUser(authData.user);
        setAccessToken(authData.accessToken)
    }

    const logout = async () => {
        try {
            await logoutApi()
        } finally {
            setUser(null)
            setAccessToken(null)
        }
    }
    const value: AuthContextValue = {
        user,
        loading,
        isAuthenticated: user !== null,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}

export const useAuthContext = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error(
            "useAuthContext must be used within an AuthProvider"
        );
    }

    return context;
}