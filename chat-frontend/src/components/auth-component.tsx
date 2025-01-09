'use client'

import { AuthService } from "@/ApiServices/AuthService/AuthService";
import { Token } from "@/ApiServices/AuthService/Models/TokenModel";
import { useService } from "@/customHooks/useService";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

const loginUrl = '/auth/login';
const chatUrl = '/chats'

type AuthPair = { isAuth: boolean, token: Token | null };
const defaultValue = { isAuth: false, token: null, tokenInfo: null };

export const AuthContext = createContext<AuthPair>(defaultValue);

export default function AuthComponent({ mustBeAuth, children }: { mustBeAuth: boolean, children: Readonly<React.ReactNode> }) {
    const router = useRouter();
    const [authData, setAuthData] = useState<AuthPair>(defaultValue);

    const authService = useService(AuthService);

    useEffect(() => {
        async function updateCallback(token: Token | null) {
            const isAuth = token !== null;
            setAuthData({ isAuth, token });
        }

        authService.updateCallbacks.push(updateCallback);

        authService
            .refreshToken()
            .then(token => {
                const isAuth = token !== null;
                updateCallback(token);

                if (mustBeAuth == isAuth)
                    return;

                const path = isAuth ? chatUrl : loginUrl;
                router.push(path);
            });

        return () => { authService.updateCallbacks.remove(updateCallback); }
    }, []);

    return (
        <AuthContext.Provider value={authData}>
            {children}
        </AuthContext.Provider>);
}
