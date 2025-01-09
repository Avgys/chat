'use client'

import { AuthContext } from "@/components/auth-component";
import ContactList from "@/components/chat-components/contact-list";
import { Chat } from "@/models/Chat";
import { ContentMessage } from "@/models/Message";
import { useAppSelector, useAppStore } from "@/store/hooks";
import { addChats, addMessage, getCurrentCallChat, getCurrentChat, updateOrAddChat } from "@/store/slice";
import { useCallback, useContext, useEffect, useState } from "react";
import { CallArea } from "../../components/chat-components/call-area/call-area";
import { ContactInfo } from "@/components/chat-components/contact-info";
import ChatArea from "@/components/chat-components/chat-area/chat-area";
import { SignalConnection } from "@/ApiServices/SignalService/SignalService";
import { useService } from "@/customHooks/useService";
import { ChatService } from "@/ApiServices/ChatService/ChatService";

export default function ChatComponent() {
  const { isAuth } = useContext(AuthContext);
  const [initiated, setInitiated] = useState(true);

  const selectedChat = useAppSelector(x => getCurrentChat(x.chatState));
  const currentCall = useAppSelector(x => getCurrentCallChat(x.chatState));

  const store = useAppStore();

  const chatService = useService(ChatService);
  const signalConnection = useService(SignalConnection);

  const receiveNewMessage = useCallback(async (newMessage: ContentMessage) => {
    const chats = store.getState().chatState.chats;

    let cachedChat = chats.find(x => x.contact.ChatId == newMessage.Contact.ChatId);

    if (!cachedChat?.messages) {
      const loadedChat = await chatService.LoadChat(newMessage.Contact.ChatId!);
      store.dispatch(updateOrAddChat(loadedChat));
    }
    else {
      store.dispatch(addMessage(newMessage));
      //TODO OPTIMIZE AND DECIDE TO LOAD FULL CHAT OR ONLY ADD CONTACT      
    }
  }, []);

  useEffect(() => {
    if (isAuth) {
      const tasks = [
        chatService
          .loadContacts()
          .then((contacts) => {
            const newChats: Chat[] = contacts.map(x => { return { contact: x, messages: null, participants: null, isLoaded: false } });
            store.dispatch(addChats(newChats))
          }),
        signalConnection.connectToServer(),
      ];

      Promise.all(tasks).then(() => setInitiated(true));
      signalConnection.onMessageReceive = receiveNewMessage;

      return () => {
        signalConnection.onMessageReceive = null
      };
    }
  }, [isAuth]);

  return (
    <main className="justify-center">
      {isAuth && initiated &&
        <div className="flex bg-gray-900 text-gray-100 h-screen">
          <ContactList />
          <div className="flex flex-col w-full h-full">
            {selectedChat && <ContactInfo selectedChat={selectedChat} isInCall={!!currentCall} />}
            <div className="flex w-full overflow-y-auto h-full">
              <CallArea className="flex-1 min-w-1/2" currentCaller={currentCall} />
              {selectedChat && <ChatArea className="flex-1 overflow-y-auto" chat={selectedChat} />}
            </div>
            {/* {(!selectedChat && !currentCall) && <div className="h-full w-full flex-1 w-full flex items-center justify-center text-center text-gray-400">
              Select a contact to start chatting
            </div>} */}
          </div>
        </div>}
    </main>
  );
}

