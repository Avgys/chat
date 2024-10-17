import AuthComponent from "@/components/AuthComponent";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (  
        <AuthComponent mustBeAuth={false}>
            {children}
        </AuthComponent>);
}