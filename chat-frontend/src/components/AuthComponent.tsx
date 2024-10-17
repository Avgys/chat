'use client'

import { AuthService } from "@/ApiServices/AuthService/AuthService";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

const loginUrl = '/auth/login';
const chatUrl = '/chats'

type AuthPair = { isAuth: boolean, token: string | null };
const defaultValue = { isAuth: false, token: null };
export const AuthContext = createContext<AuthPair>(defaultValue);

export default function AuthComponent({ mustBeAuth, children }: { mustBeAuth: boolean, children: Readonly<React.ReactNode> }) {
    const router = useRouter();
    const [authData, setAuthData] = useState<AuthPair>(defaultValue);

    useEffect(() => {
        AuthService.RefreshToken().then(token => {
            const isAuth = token !== null;
            setAuthData({ isAuth, token });
            if (mustBeAuth == isAuth)
                return;

            const path = isAuth ? chatUrl : loginUrl;
            router.push(path);
        })
    }, []);

    return (
        <AuthContext.Provider value={authData}>
            {children}
        </AuthContext.Provider>);
}
