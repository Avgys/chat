'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from "../../auth-component"
import { ChatService } from "@/ApiServices/ChatService/ChatService"
import { Chat } from "@/models/Chat"
import { useAppDispatch } from "@/store/hooks"
import { addMessage } from "@/store/slice"
import { cn } from "@/lib/utils"
import { useService } from "@/customHooks/useService"
import { MessageComponent } from "./message-component"

function ChatArea({ chat, className }: { className: string, chat: Chat }) {
  const [message, setMessage] = useState("");
  const messageEndRef = useRef<HTMLSpanElement>(null);

  const messages = chat?.messages ?? [];

  const { token } = useContext(AuthContext);
  const currentUserId = useMemo(() => Number(token!.UserId), [token]);
  const chatService = useService(ChatService);

  const dispatch = useAppDispatch();

  useEffect(() => { messageEndRef.current && messageEndRef.current!.scrollIntoView(); }, [chat?.messages]);

  const sendMessage = useCallback((messageText: string) => {
    if (chat == null || !(chat.contact.ChatId ?? chat.contact.UserId))
      return;

    chatService.sendMessage(messageText, chat.contact).then(result => {
      const { message, isMessageReceived } = result;
      if (isMessageReceived)
        dispatch(addMessage(message));
      messageEndRef.current!.scrollIntoView();
      setMessage("")
    });
  }, [chatService]);

  const messagesToShow = useMemo(() => {
    return messages.length > 0
      ? <>
        {messages.map((x, i) => <MessageComponent key={i} message={x} isSender={x.Sender?.UserId == currentUserId} />)}
      </>
      : <div className="text-center text-gray-400 my-4">
        This is the beginning of your conversation with {chat?.contact.Name}
      </div>
  }, [messages]);

  return (<>
    <div className={cn("flex flex-auto w-full flex-col bg-gray-900 h-full", className)}>
      <ScrollArea className="p-4 h-full">
        {messagesToShow}
        <span ref={messageEndRef} />
      </ScrollArea>
      <div className="flex-1 p-4 border-t border-gray-700">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(message) }} className="flex items-center">
          <Input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mr-2 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
          />
          <Button disabled={chat === null} type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div >
  </>);
}

export default ChatArea;