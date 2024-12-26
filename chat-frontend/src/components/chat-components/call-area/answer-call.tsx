'use client'

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import {  Phone,  PhoneOff, Camera } from 'lucide-react'
import { useCallback, } from "react";
import { MediaKind } from "../../../Models/MediaKind";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks";
import { findChatByContact, findChatById, selectCaller, selectChat, updateOrAddChat } from "@/store/slice";
import { ChatService } from "@/ApiServices/ChatService/ChatService";
import { CallContact } from "./call-area";

export default function AnswerCall({callingContact} : {callingContact : CallContact}) {

    const dispatch = useAppDispatch();
    const chatState = useAppSelector(x => x.chatState);    

    const answerCall = useCallback(async (pesmissions: MediaKind) => {
        if (callingContact) {
            callingContact.callback(pesmissions);

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
        }
    }, [callingContact]);

    return callingContact && (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 ">
            <Avatar className="w-full">
                <AvatarImage src={'face.jpeg'} alt={callingContact.contact.Name} />
                <AvatarFallback>{callingContact.contact.Name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="space-x-4">
                <Button variant="ghost" size="icon" onClick={() => answerCall({ audio: true, video: true })}>
                    <Camera className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" >
                    <Phone className="h-4 w-4" onClick={() => answerCall({ audio: true, video: false })} />
                </Button>
                <Button variant="ghost" size="icon" >
                    <PhoneOff className="h-4 w-4" onClick={() => answerCall({ audio: false, video: false })} />
                </Button>
            </div>
        </div>
    )
}