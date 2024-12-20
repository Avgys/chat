import { useEffect, useState } from "react";
import ChatArea from "./chat-area";
import CallArea from "./call-area";
import { ContactInfo } from "./contact-info";
import { getCurrentCallChat, getCurrentChat, selectCaller } from "@/store/slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { WebRTCService } from "@/ApiServices/WebRTC/WebRTC";
import { Contact } from "@/Models/Contact";
import AnswerCall from "./answer-call";

export function SelectedContact() {
    const [isInCall, setIsInCall] = useState(false);
    const [callingContact, setCallingContact] = useState<{ chatId: number, callback: (mediaKind: MediaKind) => void }>();

    const selectedChat = useAppSelector(x => getCurrentChat(x.chatState));
    const currentCall = useAppSelector(x => getCurrentCallChat(x.chatState));
    const dispatch = useAppDispatch();

    useEffect(() => {
        WebRTCService.isUserAnswer = (chatId) => {

            answerCall(chatId);

            return new Promise<MediaKind>((resolve, reject) => {
                setCallingContact({ chatId, callback: resolve })
            });
        }

        () => { WebRTCService.isUserAnswer = null; }
    }, []);

    async function answerCall(contact:Contact, pesmissions: MediaKind) {
        if (callingContact)
            callingContact.callback(pesmissions);
    }

    function startCall(isVideo: boolean) {
        if (!selectedChat)
            return;

        dispatch(selectCaller(selectedChat));
        setIsInCall(true);
    }

    function endCall() {
        dispatch(selectCaller(null));
        setIsInCall(false);
    }

    return (
        selectedChat ? (
            <div className="flex-1 flex flex-col bg-gray-900 h-screen" >
                <ContactInfo selectedChat={selectedChat} onCallStart={startCall} isInCall={isInCall} />
                <div className="flex flex-1 bg-gray-900 text-gray-100 overflow-auto">

                    {callingContact && <AnswerCall chatId={callingContact.chatId} answerCall={answerCall} />}
                    {isInCall && currentCall && <CallArea chat={currentCall} stopCall={endCall} />}
                    <ChatArea chat={selectedChat} />
                </div>
            </div>)
            :
            (<div className="flex-1 flex items-center justify-center text-gray-400">
                Select a contact to start chatting
            </div>)
    )
}

export type MediaKind = {
    audio: boolean;
    video: boolean;
}