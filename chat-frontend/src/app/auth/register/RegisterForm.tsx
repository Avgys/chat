'use client'

import { AuthService } from "@/ApiServices/AuthService/AuthService";
import LoginForm from "@/components/ui/login-form";
import { useService } from "@/customHooks/useService";
import { Credentials } from "@/models/Credentials";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
    const router = useRouter();
    const authService = useService(AuthService);

    function Register(credentials: Credentials) {
        authService.Register(credentials).then((response) => {
            if (response)
                router.push('/auth/login');
            //TODO add notification
        });
    }
    return (<LoginForm onSubmit={Register}>Sign up</LoginForm>);
}