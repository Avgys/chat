'use client';
import { WebRTCService } from "@/ApiServices/WebRTC/WebRTC";
import AnswerCall from "@/components/chat-components/call-area/answer-call";
import VoiceChat from "@/components/chat-components/call-area/voice-chat";
import { cn, createEmptyStream, getLocalMedia } from "@/lib/utils";
import { ContactModel } from "@/Models/Contact";
import { MediaKind } from "@/Models/MediaKind";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCurrentCallChat, getCurrentChat, selectCaller } from "@/store/slice";
import { useCallback, useEffect, useState } from "react";

export type CallContact = { contact: ContactModel, callback: (mediaKind: MediaKind) => void };

export function CallArea({ className }: { className: string }) {

  const selectedCaller = useAppSelector(x => getCurrentCallChat(x.chatState));
  const chat = useAppSelector(x => getCurrentChat(x.chatState));

  const [callingContact, setCallingContact] = useState<CallContact>();
  const dispatch = useAppDispatch();

  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();

  useEffect(() => {
    WebRTCService.isUserAnswer = (contact) => (callingContact === undefined)
      ? new Promise<MediaKind>((resolve, reject) => {
        setCallingContact({
          contact, callback: (kind) => {
            setCallingContact(undefined);
            resolve(kind)
          }
        })
      })
      : new Promise<MediaKind>((resolve, reject) => {
        setCallingContact(undefined);
        resolve({ video: false, audio: false })
      });

    return () => { WebRTCService.isUserAnswer = null; }
  }, [chat]);

  const stopMedia = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(undefined);
    }

    if (remoteStream)
      remoteStream.getTracks().forEach((track) => track.stop());

    console.log("Screen sharing stopped.");
  }, [localStream]);


  useEffect(() => {
    WebRTCService.onInitiated = async (connection) => {
      const fakeStream = new MediaStream();
      setRemoteStream(fakeStream);

      const localStream = await getLocalMedia();
      setLocalStream(localStream);
      
      WebRTCService.setInputStream(fakeStream);
      WebRTCService.setOutputStream(localStream);
    };

  }, []);

  function stopCall() {
    stopMedia();
    WebRTCService.endConnection();
    dispatch(selectCaller(null));
  }

  return (callingContact || selectedCaller) && (
    <div className={cn("min-w-64 h-full p-6 flex border-gray-700 border-r", className)}>
      {callingContact && <AnswerCall callingContact={callingContact} />}
      {selectedCaller && <VoiceChat
        callerChat={selectedCaller}
        stopCall={stopCall}
        localStream={localStream!}
        remoteStream={remoteStream!}
      />}
    </div>
  );
}


