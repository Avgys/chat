'use client'

import { AuthService } from "@/ApiServices/AuthService/AuthService";
import LoginForm from "@/components/ui/loginForm";
import { Credentials } from "@/Models/Credentials";

export default function RegisterForm() {


    function Register(credentials: Credentials) {
        AuthService.Register(credentials).then((response) => {

            //TODO add notification

        });
    }
    return (<LoginForm onSubmit={Register}>Sign up</LoginForm>);
}