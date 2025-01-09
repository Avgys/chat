'use client'

import { AuthService } from "@/ApiServices/AuthService/AuthService";
import LoginForm from "@/components/ui/login-form";
import { useService } from "@/customHooks/useService";
import { Credentials } from "@/models/Credentials";
import { useRouter } from "next/navigation";

export default function SingInForm() {
    const router = useRouter();
    const authService = useService(AuthService);

    function Login(credentials: Credentials) {
        authService.Login(credentials).then((response) => router.push('/'));
    }

    return <LoginForm onSubmit={Login}>Sign in</LoginForm>
}
