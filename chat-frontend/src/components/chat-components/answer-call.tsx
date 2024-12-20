'use client'

import { Chat } from "@/Models/Chat";
import { Contact } from "@/Models/Contact";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Search, Phone, Video, Mic, MicOff, PhoneOff, Camera, CameraOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from "react";
import { WebRTCService } from "@/ApiServices/WebRTC/WebRTC";
import { MediaKind } from "./selected-contact";
import { useAppSelector } from "@/store/hooks";
import { findChatById } from "@/store/slice";

export default function AnswerCall({ chatId, answerCall }: { chatId: number, answerCall: (permission: MediaKind) => void }) {
    const [contact, setContact] = useState<Contact>();

    const cachedChat = useAppSelector(x => findChatById(x.chatState, chatId))

    // useEffect(() => {
    //     let cachedChat = chats.find(x => x.contact.ChatId == newMessage.ChatId);

    //     if (!cachedChat?.messages) {
    //         const loadedChat = await ChatService.LoadChat(newMessage.ChatId);
    //         store.dispatch(updateOrAddChat(loadedChat));
    //     }
    //     else {
    //         store.dispatch(addMessage(newMessage));
    //         //TODO OPTIMIZE AND DECIDE TO LOAD FULL CHAT OR ONLY ADD CONTACT      
    //     }
    // }, [chatId, answerCall]);

    // const contacts = chat.participants;

    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 border-gray-700 border-r">
            {contact && <Avatar className="w-full h-full">
                <AvatarImage src={contact.AvatarSrc} alt={contact.Name} />
                <AvatarFallback>{contact.Name.slice(0, 2)}</AvatarFallback>
            </Avatar>}
            <div className="space-x-4">
                <Button variant="ghost" size="icon" onClick={() => answerCall({ audio: false, video: false })}>
                    <Camera className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" >
                    <PhoneOff className="h-4 w-4" onClick={() => answerCall({ audio: false, video: false })} />
                </Button>
            </div>
        </div>
    )
}