'use client'

import { ChatService } from "@/ApiServices/ChatService/ChatService";
import { SignalService } from "@/ApiServices/SignalService/SignalService";
import { AuthContext } from "@/components/AuthComponent";
import { ChatPageComponent } from "@/components/chat-components/chat";
import { Contact } from "@/Models/Contact";
import { useContext, useState, useEffect } from "react";

export default function Chat() {
  const [initiated, setInitiated] = useState(true);
  const authData = useContext(AuthContext)
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (authData.isAuth) {
      const tasks = [];
      //tasks.push(ChatService.LoadContacts().then((response) => setContacts(response)));
      tasks.push(SignalService.init(authData.token!).then(() => setInitiated(true)));

      Promise.all(tasks).then(() => setInitiated(true));
    }
  }, [authData]);

  return (
    <main className="justify-center">
      {authData.isAuth && initiated && <ChatPageComponent contacts={contacts}/>}
    </main>
  );
}
