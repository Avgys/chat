'use client'

import { AuthService } from "@/ApiServices/AuthService/AuthService";
import LoginForm from "@/components/ui/loginForm";
import { Credentials } from "@/Models/Credentials";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
    const router = useRouter();

    function Register(credentials: Credentials) {
        AuthService.Register(credentials).then((response) => {
            if(response)
                router.push('/auth/login');
            //TODO add notification

        });
    }
    return (<LoginForm onSubmit={Register}>Sign up</LoginForm>);
}