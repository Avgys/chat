'use client'

import { Chat } from "@/models/Chat";
import { Button } from "../../ui/button";
import { Mic, MicOff, PhoneOff, Camera, CameraOff } from 'lucide-react'
import { useCallback, useEffect, useState } from "react";
import { MediaKind } from "@/models/MediaKind";
import { ContentMessage, MessageType } from "@/models/Message";
import { InterClientConnection } from "@/ApiServices/WebRTC/InterClientConnection";
import { useService } from "@/customHooks/useService";
import { VolumeSlider } from "@/components/ui/volume-slider";
import { Media } from "../../../lib/media";
import { CallerIcon } from "./caller-icon";
import { ConnectionManager } from "@/ApiServices/WebRTC/ConnectionManager";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCaller } from "@/store/slice";
import { stat } from "fs";

export default function VoiceChat({ initialPermissions, currentCaller }: { initialPermissions: MediaKind, currentCaller: Chat | null }) {
    const dispatch = useAppDispatch();

    const connectionManager = useService(ConnectionManager);

    const [localMedia, setLocalMedia] = useState<Media>();
    const [remoteCallers, setRemoteCallers] = useState<InterClientConnection[]>([]);

    const [mediaPermissions, setMediaPermissions] = useState<MediaKind>(initialPermissions);

    const [callState, setCallState] = useState<string>('Not connected');

    useEffect(() => { setMediaPermissions(initialPermissions) }, [initialPermissions]);

    useEffect(() => {
        connectionManager.onConnecting = (localMedia: Media, remoteCallers: InterClientConnection[]) => {
            setLocalMedia(localMedia);
            setRemoteCallers(remoteCallers);
            setCallState("Connecting...");
        };

        connectionManager.onConnected = () => {
            setCallState("Connected");
            sendPermissions();
        }

        connectionManager.onClosed = () => {
            setRemoteCallers([]);
            setLocalMedia(undefined);
            dispatch(selectCaller(null));
            setCallState("Call ended");
        }

        connectionManager.onStateChange = (state) => {
            setCallState(state);
        }

        () => {
            connectionManager.onConnecting = undefined;
            connectionManager.onConnected = undefined;
            connectionManager.onClosed = undefined;
        }
    }, [connectionManager]);

    const stopCall = useCallback(() => {
        connectionManager.endCall();
        dispatch(selectCaller(null));
    }, [connectionManager]);

    const sendPermissions = useCallback(() => {
        if (connectionManager.state !== 'connected' || !currentCaller)
            return;

        const message: ContentMessage = {
            Contact: currentCaller!.contact,
            Type: MessageType.MediaChange,
            Content: JSON.stringify(mediaPermissions),
            TimeStampUtc: (new Date()).toISOString()
        };

        connectionManager.sendPeerMessage(message);
    }, [mediaPermissions, connectionManager]);

    const toggleMedia = useCallback((permissions: MediaKind) => {
        if (permissions.audio)
            setMediaPermissions(prevState => { return { ...prevState, audio: !prevState.audio }; })
        else if (permissions.video)
            setMediaPermissions(prevState => { return { ...prevState, video: !prevState.video }; });
    }, [setMediaPermissions])

    useEffect(() => {
        if (localMedia)
            localMedia.setMediaKind(mediaPermissions);

        sendPermissions();
    }, [mediaPermissions, localMedia, currentCaller]);

    return currentCaller && (
        <div className="flex-1 flex flex-col max-h-full h-full items-center justify-center bg-gray-900">
            <span>{callState}</span>
            {remoteCallers.map(x => <CallerIcon key={x.contact.UserId} connection={x} media={x.media} controls={true} userAudio={true} />)}

            {/*LocalCaller */}
            <div className="space-x-4 m-y-16 flex-2">
                <Button variant="ghost" size="icon" onClick={() => toggleMedia({ audio: true })}>
                    {mediaPermissions.audio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toggleMedia({ video: true })}>
                    {mediaPermissions.video ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </Button>
                <Button variant="destructive" size="icon" onClick={stopCall} >
                    <PhoneOff className="h-4 w-4" />
                </Button>
                <VolumeSlider defaultValue={100} max={200} onChange={(value) => localMedia?.modifyVolume(value)} />
            </div>
            {mediaPermissions.video!
                && localMedia
                && <CallerIcon userAudio={false} userVideo={mediaPermissions.video!} media={localMedia} controls={false} />}
        </div >
    )
}