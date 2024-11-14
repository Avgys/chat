'use client'

import { AuthService } from "@/ApiServices/AuthService/AuthService";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

const loginUrl = '/auth/login';
const chatUrl = '/chats'

type AuthPair = { isAuth: boolean, token: string | null, tokenInfo: Token | null };
const defaultValue = { isAuth: false, token: null, tokenInfo: null };

export const AuthContext = createContext<AuthPair>(defaultValue);

export default function AuthComponent({ mustBeAuth, children }: { mustBeAuth: boolean, children: Readonly<React.ReactNode> }) {
    const router = useRouter();
    const [authData, setAuthData] = useState<AuthPair>(defaultValue);

    useEffect(() => {
        function updateCallback(token: string | null) {
            const isAuth = token !== null;
            const tokenInfo = isAuth ? AuthService.DecodeToken(token) : null;
            setAuthData({ isAuth, token, tokenInfo });
        }

        AuthService.UpdateCallbacks.push(updateCallback);

        AuthService.RefreshToken().then(token => {
            const isAuth = token !== null;
            updateCallback(token);

            if (mustBeAuth == isAuth)
                return;

            const path = isAuth ? chatUrl : loginUrl;
            router.push(path);
        });

        return () => { AuthService.UpdateCallbacks.splice(AuthService.UpdateCallbacks.findIndex(x => x == updateCallback), 1); }
    }, []);

    return (
        <AuthContext.Provider value={authData}>
            {children}
        </AuthContext.Provider>);
}
