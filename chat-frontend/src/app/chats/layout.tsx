'use client'

import { extendArrayPrototype } from '@/lib/utils/ArrayExtension';
import AuthComponent from "@/components/auth-component";
import { store } from "@/store/store";
import { Provider } from "react-redux";

export default function ChatLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    extendArrayPrototype();
    return (
        <AuthComponent mustBeAuth={true}>
            <Provider store={store}>
                {children}
            </Provider>
        </AuthComponent>
    );
}