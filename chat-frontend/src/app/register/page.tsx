'use client'

import Link from "next/link"
import { Credentials } from "@/types/Credentials"
import LoginForm from "@/components/ui/loginForm";
import { useRouter } from "next/navigation"
import { AuthService } from "@/ApiServices/AuthService/AuthService";

export default function RegisterPageComponent() {
  const router = useRouter();
  
  function Register(credentials: Credentials){
    console.log('Registering' + JSON.stringify(credentials));
    
    AuthService.Register(credentials).then((response) => {
      if(response)
        router.push('/login');      
      else
        console.log(credentials.login + 'already registered');          
    });    
  }

  return (
    <div className="min-h-screen w-full space-y-6 flex flex-col items-center justify-center bg-muted">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">Enter your credentials to create your account</p>
      </div>
      <LoginForm onSubmit={Register} buttonText={"Sign up"}/>
      <p className="text-center text-sm text-muted-foreground">
        Have an account?{" "}
        <Link href="./login" className="font-medium underline underline-offset-4 hover:text-primary" prefetch={false}>
          Sign in
        </Link>
      </p>   
    </div>
  )
}