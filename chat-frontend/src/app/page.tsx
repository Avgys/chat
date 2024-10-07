"use client"

import { AuthService } from "@/ApiServices/AuthService/AuthService";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    AuthService.isAuth().then(isAuth => {
      const path = isAuth ? '/chats' : '/login';
      router.push(path);
    });
  }, []);

  return <div className="app">Pending...</div>
}