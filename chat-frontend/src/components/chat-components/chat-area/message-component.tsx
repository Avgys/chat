'use client';
import { FormatStringDate } from "@/models/FormatStringDate";
import { ContentMessage } from "@/models/Message";

export function MessageComponent({ message, isSender }: { message: ContentMessage; isSender: boolean; }) {
  return <div
    key={message.Id}
    className={`flex ${isSender ? 'justify-end' : 'justify-start'} my-5`}>
    <div
      className={`max-w-[70%] rounded-lg p-3 ${isSender
        ? 'bg-blue-500 text-white rounded-br-none'
        : 'bg-blue-300 text-gray-800 rounded-bl-none'}`}>
      <p className="break-all w-full">
        {message.Content}
      </p>
      <p className={`text-xs mt-1 ${isSender ? 'text-blue-100' : 'text-gray-500'}`}>
        {FormatStringDate(message.TimeStampUtc, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'long' })}
      </p>
    </div>
  </div>;
}
