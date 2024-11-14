'use client'

import { ChatService } from "@/ApiServices/ChatService/ChatService";
import { SignalService } from "@/ApiServices/SignalService/SignalService";
import { AuthContext } from "@/components/AuthComponent";
import ChatArea from "@/components/chat-components/chat-area";
import ContactList from "@/components/chat-components/contact-list";
import { Chat } from "@/Models/Chat";
import { ChatMessage } from "@/Models/Message";
import { useAppDispatch, useAppStore } from "@/store/hooks";
import { addChats, addMessage, updateOrAddChat } from "@/store/slice";
import { useContext, useEffect, useState } from "react";

export default function ChatComponent() {
  const { isAuth } = useContext(AuthContext);
  const [initiated, setInitiated] = useState(true);

  const store = useAppStore();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuth) {
      const tasks = [
        ChatService.loadContacts().then((contacts) => {
          const newChats: Chat[] = contacts.map(x => { return { contact: x, messages: null, participants: null, isLoaded: false } });
          dispatch(addChats(newChats))
        }),
        SignalService.Init()];

      Promise.all(tasks).then(() => setInitiated(true));

      SignalService.OnReceiveMessage.push(AddMessage);
      return () => { SignalService.OnReceiveMessage.splice(SignalService.OnReceiveMessage.findIndex(x => x == AddMessage), 1); };
    }
  }, [isAuth]);


  async function AddMessage(newMessage: ChatMessage) {
    const chats = store.getState().chatState.chats;

    let cachedChat = chats.find(x => x.contact.ChatId == newMessage.ChatId);

    if (!cachedChat?.messages) {
      const loadedChat = (await ChatService.LoadChat(newMessage.ChatId))!;
      dispatch(updateOrAddChat(loadedChat));
    }
    else {
      dispatch(addMessage(newMessage));

      //TODO OPTIMIES AND DECIDE TO LOAD FULL CHAT OR ONLY ADD CONTACT
      //   if (cachedChat == selectedChat) {
      //     cachedChat!.messages = [newMessage];
      //     ChatService.LoadParticipantsInChat(newMessage.ChatId).then(participants => cachedChat!.participants = participants);
      //   }

      // }
      // else {
      //   cachedChat = {
      //     contact: loadedChat,
      //     messages: null,
      //     participants: null
      //   }

      // }
    }
  }



  return (
    <main className="justify-center">
      {isAuth && initiated &&
        <div className="flex h-screen bg-gray-900 text-gray-100">
          <ContactList />
          <ChatArea />
        </div>}
    </main>
  );
}
