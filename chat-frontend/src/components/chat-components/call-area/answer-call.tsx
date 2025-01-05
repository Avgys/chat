'use client'

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Phone, PhoneOff, Camera } from 'lucide-react'
import { useCallback, } from "react";
import { MediaKind } from "../../../Models/MediaKind";
import { useAppDispatch, useAppSelector, } from "@/store/hooks";
import { findChatByContact, selectCaller, updateOrAddChat } from "@/store/slice";
import { ChatService } from "@/ApiServices/ChatService/ChatService";
import { CallContact } from "./call-area";

export default function AnswerCall({ callingContact }: { callingContact: CallContact }) {

    const dispatch = useAppDispatch();
    const chatState = useAppSelector(x => x.chatState);

    const answerCall = useCallback(async (pesmissions: MediaKind) => {
        if (callingContact) {
            if (pesmissions.audio || pesmissions.video) {
                let loadedChat = findChatByContact(chatState, callingContact.contact);

                if (!loadedChat) {
                    loadedChat = callingContact.contact.ChatId
                        ? await ChatService.LoadChat(callingContact.contact.ChatId)
                        : { contact: callingContact.contact, participants: null, messages: null, isLoaded: false };

                    dispatch(updateOrAddChat(loadedChat))
                }

                dispatch(selectCaller(loadedChat));
            }
            
            callingContact.callback(pesmissions);
        }
    }, [callingContact]);

    return callingContact && (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 ">
            <h2 className="text-base sm:text-lg md:text-2xl lg:text-4xl xl:text-6xl font-bold text-gray-100">{callingContact.contact.Name}</h2>
            <Avatar className="w-full m-4">
                <AvatarImage src={'face.jpeg'} alt={callingContact.contact.Name} />
                <AvatarFallback>{callingContact.contact.Name?.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="space-x-4">
                <Button variant="ghost" size="icon" onClick={() => answerCall({ audio: true, video: true })}>
                    <Camera className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => answerCall({ audio: true, video: false })} >
                    <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => answerCall({ audio: false, video: false })} >
                    <PhoneOff className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}