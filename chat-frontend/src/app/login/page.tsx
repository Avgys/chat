'use client'

import Link from "next/link"
import LoginForm from "@/components/ui/loginForm"
import { Credentials } from "@/Models/Credentials"
import { AuthService } from "@/ApiServices/AuthService/AuthService"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPageComponent() {
  const router = useRouter();

  useEffect(() => {
    AuthService.isAuth().then(isAuth => {
      if (isAuth)
        router.push('/chats');
    });
  }, []);

  function Login(credentials: Credentials){
    AuthService.Login(credentials).then((response) => {
      if(response)
        router.push('/');      
      else
        //TODO add notification
        console.log(credentials.login + 'already registered');          
    }); 
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">Enter your credentials to access your account</p>
      </div>
      <LoginForm onSubmit={Login} buttonText={"Sign in"}/>
      <p className="text-center text-sm text-muted-foreground">
        Have you forgotten your password?{" "}
      <Link
              href="#"
              className="text-sm font-medium underline underline-offset-4 hover:text-primary"
              prefetch={false}
            >
              Restore Password
            </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="./register" className="font-medium underline underline-offset-4 hover:text-primary" prefetch={false}>
          Sign up
        </Link>            
      </p>        
    </div>     
  )
}