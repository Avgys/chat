'use client'

import { ChatService } from "@/ApiServices/ChatService/ChatService";
import { SignalService } from "@/ApiServices/SignalService/SignalService";
import { WebRTCService } from "@/ApiServices/WebRTC/WebRTC";
import { AuthContext } from "@/components/authComponent";
import ContactList from "@/components/chat-components/contact-list";
import { Chat } from "@/Models/Chat";
import { ContactModel } from "@/Models/Contact";
import { MediaKind } from "@/Models/MediaKind";
import { ContentMessage } from "@/Models/Message";
import { useAppSelector, useAppStore } from "@/store/hooks";
import { addChats, addMessage, getCurrentCallChat, getCurrentChat, updateOrAddChat } from "@/store/slice";
import { useContext, useEffect, useState } from "react";
import { CallArea } from "../../components/chat-components/call-area/call-area";
import { ContactInfo } from "@/components/chat-components/contact-info";
import ChatArea from "@/components/chat-components/chat-area";

export default function ChatComponent() {
  const { isAuth } = useContext(AuthContext);
  const [initiated, setInitiated] = useState(true);

  const selectedChat = useAppSelector(x => getCurrentChat(x.chatState));
  const currentCall = useAppSelector(x => getCurrentCallChat(x.chatState));

  const store = useAppStore();

  useEffect(() => {
    if (isAuth) {
      const tasks = [
        ChatService.loadContacts().then((contacts) => {
          const newChats: Chat[] = contacts.map(x => { return { contact: x, messages: null, participants: null, isLoaded: false } });
          store.dispatch(addChats(newChats))
        }),
        SignalService.connectToServer(),
      ];

      Promise.all(tasks).then(() => setInitiated(true));

      SignalService.onMessageReceive = AddMessage;

      return () => {
        SignalService.onMessageReceive = null
      };
    }
  }, [isAuth]);


  async function AddMessage(newMessage: ContentMessage) {
    const chats = store.getState().chatState.chats;

    let cachedChat = chats.find(x => x.contact.ChatId == newMessage.Contact.ChatId);

    if (!cachedChat?.messages) {
      const loadedChat = await ChatService.LoadChat(newMessage.Contact.ChatId!);
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
        <div className="flex bg-gray-900 text-gray-100 h-screen">
          <ContactList />
          <div className="flex flex-col w-full h-full">
            {selectedChat && <ContactInfo selectedChat={selectedChat} isInCall={!!currentCall} />}
            <div className="flex w-full h-[95%]">
              <CallArea className="flex-1 h-full min-w-1/2"/>
              {selectedChat
                ? <ChatArea className="flex-1" chat={selectedChat} />
                : <div className="h-full w-full flex-1 w-full flex items-center justify-center text-center text-gray-400">
                    Select a contact to start chatting
                  </div>}
            </div>
          </div>
        </div>}
    </main>
  );
}

