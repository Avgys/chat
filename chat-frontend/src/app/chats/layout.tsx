import AuthComponent from "@/components/AuthComponent";


export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <AuthComponent mustBeAuth={true}>
            {children}
        </AuthComponent>
    );
}