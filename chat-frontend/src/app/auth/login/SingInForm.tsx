'use client'

import { AuthService } from "@/ApiServices/AuthService/AuthService";
import LoginForm from "@/components/ui/loginForm";
import { Credentials } from "@/Models/Credentials";
import { useRouter } from "next/navigation";

export default function SingInForm() {
    const router = useRouter();
    function Login(credentials: Credentials) {
        AuthService.Login(credentials).then((response) => router.push('/'));
    }

    return <LoginForm onSubmit={Login}>Sign in</LoginForm>
}
