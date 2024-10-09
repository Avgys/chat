'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Credentials } from "@/Models/Credentials";
import { useForm } from "react-hook-form";

export default function LoginForm({onSubmit, buttonText} : { onSubmit: (a: Credentials) => void, buttonText: string}){
    const { register, handleSubmit, formState: { errors } } = useForm<Credentials>();

    function onFormSubmit(data: any){
      console.log(data);
      onSubmit({
        login: data.login,
        password: data.password
      })
    }

    return(
        <form className="grid gap-4 w-96" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="login">Login</Label>
              <Input id="login" type="text" className={errors.login && "border border-red-500"} placeholder="Login"  required  {...register('login', { required: true, minLength: 10, maxLength: 64 })} />
              {errors.login && <p>Login must be at least 10 characters long</p>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" className={errors.password && "border border-red-500"} placeholder="*********" required {...register('password', { required: true, minLength: 8, maxLength: 64 })} />
              {errors.password && <p>Password must be at least 10 characters long</p>}
            </div>           
            <Button type="submit" className="w-full">
                {buttonText}
            </Button>
          </form>
    )
}