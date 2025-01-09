'use client';

import { ChatService } from "@/ApiServices/ChatService/ChatService";
import { InterClientConnection } from "@/ApiServices/WebRTC/InterClientConnection";
import AnswerCall from "@/components/chat-components/call-area/answer-call";
import VoiceChat from "@/components/chat-components/call-area/voice-chat";
import { useService } from "@/customHooks/useService";
import { cn } from "@/lib/utils";
import { Chat } from "@/models/Chat";
import { ContactModel } from "@/models/Contact";
import { MediaKind } from "@/models/MediaKind";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { findChatByContact, selectCaller, updateOrAddChat } from "@/store/slice";
import { useCallback, useEffect, useState } from "react";
import { ConnectionManager } from "@/ApiServices/WebRTC/ConnectionManager";
import { Media } from "../../../lib/media";

export function CallArea({ className, currentCaller }: { className: string, currentCaller: Chat | null }) {
  const [caller, setCallingContact] = useState<{ contact: ContactModel, answer: (mediaKind: MediaKind) => void }>();

  const [mediaPermissions, setMediaPermissions] = useState<MediaKind>({ audio: true, video: false });

  const connectionManager = useService(ConnectionManager);

  useEffect(() => {
    connectionManager.getUserCallAccept = (contact) =>
      (caller === undefined)
        ? new Promise<MediaKind>((resolve, reject) => {
          setCallingContact({
            contact,
            answer: (kind) => {
              setCallingContact(undefined);
              setMediaPermissions(kind);
              resolve(kind);
            }
          })
        })
        : new Promise<MediaKind>((resolve, reject) => {
          setCallingContact(undefined);
          resolve({ audio: false, video: false })
        });

    return () => { connectionManager.getUserCallAccept = null; }
  }, [connectionManager]);

  return (
    <div className={cn("min-w-128 p-6 flex border-gray-700 border-r", className, !(caller || currentCaller) && "hidden")}>
      {caller && <AnswerCall callingContact={caller.contact} answer={(value) => caller?.answer(value)} />}
      <VoiceChat initialPermissions={mediaPermissions} currentCaller={currentCaller} />
    </div>
  );
}