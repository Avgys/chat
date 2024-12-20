'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormatStringDate } from '@/Models/FormatStringDate'
import { ChatMessage } from "@/Models/Message"
import { Send } from "lucide-react"
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from "../authComponent"
import { WebRTCService } from "@/ApiServices/WebRTC/WebRTC"
import { ChatService } from "@/ApiServices/ChatService/ChatService"
import { Chat } from "@/Models/Chat"
import { useAppDispatch } from "@/store/hooks"
import { addMessage } from "@/store/slice"

function ChatArea({ chat }: { chat: Chat }) {
  const [message, setMessage] = useState("");
  const messageEndRef = useRef<HTMLSpanElement>(null);

  const messages = chat?.messages ?? [];

  const { tokenInfo } = useContext(AuthContext);
  const currentUserId = tokenInfo!.UserId;

  const dispatch = useAppDispatch();

  useEffect(() => { messageEndRef.current && messageEndRef.current!.scrollIntoView(); }, [chat?.messages]);

  function sendMessage(messageText: string) {
    if (chat == null || !(chat.contact.ChatId ?? chat.contact.UserId))
      return;

    ChatService.sendMessage(messageText, chat.contact).then(message => {
      dispatch(addMessage(message));
      messageEndRef.current!.scrollIntoView();
    });
  }

  const messagesToShow = useMemo(() => {
    return messages.length > 0
      ? <>
        {messages.map((x, i) => <MessageComponent key={i} message={x} isSender={x.SenderId == currentUserId} />)}
      </>
      : <div className="text-center text-gray-400 my-4">
        This is the beginning of your conversation with {chat?.contact.Name}
      </div>
  }, [messages]);

  return (<>
    <div className="flex-1 flex flex-col bg-gray-900">
      <ScrollArea className="flex-1 p-4">
        {messagesToShow}
        <span ref={messageEndRef} />
      </ScrollArea>
      <div className="flex-2 p-4 border-t border-gray-700">
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

function MessageComponent({ message, isSender }: { message: ChatMessage, isSender: boolean }) {
  return <div
    key={message.Id}
    className={`flex ${isSender ? 'justify-end' : 'justify-start'} my-5`}>
    <div
      className={`max-w-[70%] rounded-lg p-3 ${isSender
        ? 'bg-blue-500 text-white rounded-br-none'
        : 'bg-blue-300 text-gray-800 rounded-bl-none'
        }`}>
      <p>{message.Content}</p>
      <p className={`text-xs mt-1 ${isSender ? 'text-blue-100' : 'text-gray-500'}`}>
        {FormatStringDate(message.TimeStampUtc, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'long' })}
      </p>
    </div>
  </div>
}

export default ChatArea;