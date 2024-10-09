'use client'

import { AuthService } from "@/ApiServices/AuthService/AuthService";
import { SignalService } from "@/ApiServices/SignalService/SignalService";
import { ChatPageComponent } from "@/components/chat-components/chat";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Chat() {
  const router = useRouter();
  const [initiated, setInitiated] = useState(false);

  useEffect(() => {
    AuthService.isAuth().then(isAuth => {
      if (!isAuth)
        router.push('/login');
      else {
        SignalService.init()
          .then(() => setInitiated(true));
      }
    });


  }, []);

  return (
    <main className="justify-center">
      {initiated && <ChatPageComponent />}
    </main>
  );
}
