import AuthComponent from "@/components/auth-component";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (  
        <AuthComponent mustBeAuth={false}>
            {children}
        </AuthComponent>);
}