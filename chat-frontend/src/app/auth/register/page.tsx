import Link from "next/link"
import RegisterForm from "./RegisterForm";

export default function RegisterPageComponent() {


  return (
    <div className="min-h-screen w-full space-y-6 flex flex-col items-center justify-center bg-muted">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">Enter your credentials to create your account</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        Have an account?{" "}
        <Link href="./login" className="font-medium underline underline-offset-4 hover:text-primary" prefetch={false}>
          Sign in
        </Link>
      </p>
    </div>
  )
}

