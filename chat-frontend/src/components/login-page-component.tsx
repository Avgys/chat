'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChangeEvent, useState } from "react"

export function LoginPageComponent() {
  const [credentials, setCredentials] = useState({login: '', password: ''});
  const url = process.env.REACT_APP_BACKEND_URL;
  console.log(url);
  function onFormUpdate(e : ChangeEvent<HTMLInputElement>){
    // console.log

    setCredentials({
      ...credentials,
      [e.target.type] : e.target.value
    })
  }

  function Login(){
   // fetch()
  }

  return (
    <div className="grid w-full min-h-screen">
      <div className="flex items-center justify-center bg-muted p-6 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="login">Login</Label>
              <Input id="login" type="login" placeholder="Login" required onChange={onFormUpdate} />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="text-sm font-medium underline underline-offset-4 hover:text-primary"
                  prefetch={false}
                >
                  Forgot Password?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="*********" required onChange={onFormUpdate} />
            </div>
            <Button type="submit" className="w-full" onClick={Login}>
              Sign In
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="#" className="font-medium underline underline-offset-4 hover:text-primary" prefetch={false}>
              Sign up
            </Link>
          </p>
        </div>
      </div>      
    </div>
  )
}