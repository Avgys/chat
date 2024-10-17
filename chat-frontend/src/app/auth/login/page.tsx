import Link from "next/link"
import SingInForm from "./SingInForm"

export default function LoginPageComponent() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">Enter your credentials to access your account</p>
      </div>
      <SingInForm />
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