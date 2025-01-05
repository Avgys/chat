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

  const [mediaPermissions, setMediaPermissions] = useState<MediaKind>({ audio: true, video: true });

  useEffect(() => {
    WebRTCService.getUserCallAccept = (contact) => (callingContact === undefined)
      ? new Promise<boolean>((resolve, reject) => {
        setCallingContact({
          contact,
          callback: (kind) => {
            setCallingContact(undefined);
            setMediaPermissions(kind);
            resolve(kind.audio === true);
          }
        })
      })
      : new Promise<boolean>((resolve, reject) => {
        setCallingContact(undefined);
        resolve(false)
      });

    return () => { WebRTCService.getUserCallAccept = null; }
  }, [chat]);

  const stopMedia = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(undefined);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(undefined);
    }

    console.log("Screen sharing stopped.");
  }, [localStream, remoteStream]);


  useEffect(() => {
    WebRTCService.onInitiated = async (connection) => {
      const fakeStream = new MediaStream();
      setRemoteStream(fakeStream);

      const localStream = await getLocalMedia();
      setLocalStream(localStream);

      WebRTCService.setInputStream(fakeStream);
      WebRTCService.setOutputStream(localStream);

      localStream.getTracks().forEach(track => {
        track.onmute = () => console.log(`${track.kind} track is muted.`);
        track.onunmute = () => console.log(`${track.kind} track is unmuted.`);
        track.onended = () => console.log(`${track.kind} track has ended.`);
      })

    };

    WebRTCService.onClosed = stopCall;
  }, []);

  function stopCall() {
    stopMedia();
    WebRTCService.endConnection();
    dispatch(selectCaller(null));
  }

  return (callingContact || selectedCaller) && (
    <div className={cn("min-w-128 p-6 flex border-gray-700 border-r", className)}>
      {callingContact && <AnswerCall callingContact={callingContact} />}
      {selectedCaller && <VoiceChat
        callerChat={selectedCaller}
        stopCall={stopCall}
        localStream={localStream!}
        remoteStream={remoteStream!}
        initialPermissions={mediaPermissions}
      />}
    </div>
  );
}


