'use client'

import { ChatService } from "@/ApiServices/ChatService/ChatService";
import { SignalService } from "@/ApiServices/SignalService/SignalService";
import { WebRTCService } from "@/ApiServices/WebRTC/WebRTC";
import { AuthContext } from "@/components/authComponent";
import CallArea from "@/components/chat-components/call-area";
import ChatArea from "@/components/chat-components/chat-area";
import ContactList from "@/components/chat-components/contact-list";
import { SelectedContact } from "@/components/chat-components/selected-contact";
import { Chat } from "@/Models/Chat";
import { ChatMessage } from "@/Models/Message";
import { useAppStore } from "@/store/hooks";
import { addChats, addMessage, updateOrAddChat } from "@/store/slice";
import { useContext, useEffect, useState } from "react";

export default function ChatComponent() {
  const { isAuth } = useContext(AuthContext);
  const [initiated, setInitiated] = useState(true);

  const store = useAppStore();

  useEffect(() => {
    if (isAuth) {
      const tasks = [
        ChatService.loadContacts().then((contacts) => {
          const newChats: Chat[] = contacts.map(x => { return { contact: x, messages: null, participants: null, isLoaded: false } });
          store.dispatch(addChats(newChats))
        }),
        SignalService.connectToServer(),
        WebRTCService.prepareService()
      ];

      Promise.all(tasks).then(() => setInitiated(true));

      SignalService.onMessageReceive = AddMessage;
      return () => { SignalService.onMessageReceive = null };
    }
  }, [isAuth]);


  async function AddMessage(newMessage: ChatMessage) {
    const chats = store.getState().chatState.chats;

    let cachedChat = chats.find(x => x.contact.ChatId == newMessage.ChatId);
    
    if (!cachedChat?.messages) {
      const loadedChat = await ChatService.LoadChat(newMessage.ChatId);
      store.dispatch(updateOrAddChat(loadedChat));
    }
    else {
      store.dispatch(addMessage(newMessage));
      //TODO OPTIMIZE AND DECIDE TO LOAD FULL CHAT OR ONLY ADD CONTACT      
    }
  }

  return (
    <main className="justify-center">
      {isAuth && initiated &&
        <div className="flex bg-gray-900 text-gray-100">
          <ContactList />
          <SelectedContact />
        </div>}
    </main>
  );
}
