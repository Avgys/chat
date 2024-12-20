'use client'

import AuthComponent from "@/components/authComponent";
// import ReduxProvider from "@/store/ProviderComponent";
import store from "@/store/store";
import { Provider } from "react-redux";

export default function ChatLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <AuthComponent mustBeAuth={true}>
            <Provider store={store}>
                {children}
            </Provider>
        </AuthComponent>
    );
}