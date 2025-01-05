'use client'

import { Chat } from "@/Models/Chat";
import { Button } from "../../ui/button";
import { Mic, MicOff, PhoneOff, Camera, CameraOff, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useState } from "react";
import { WebRTCService } from "@/ApiServices/WebRTC/WebRTC";
import { Slider } from "../../ui/slider";
import { Caller } from "./caller-icon";
import { modifyVolumeStream } from "@/lib/utils";
import { MediaKind } from "@/Models/MediaKind";
import { ContentMessage, InterClientMessageType } from "@/Models/Message";

export default function VoiceChat({ callerChat, stopCall, localStream, remoteStream, initialPermissions }
    : {
        callerChat: Chat
        , stopCall: () => void
        , localStream: MediaStream
        , remoteStream: MediaStream
        , initialPermissions: MediaKind
    }) {

    const [mediaPermissions, setMediaPermissions] = useState<MediaKind>(initialPermissions);

    useEffect(() => {
        setMediaPermissions(initialPermissions)
    }, [initialPermissions]);

    const sendPermissions = useCallback((newPermissions: MediaKind) => {
        const message: ContentMessage = {
            Contact: {},
            Type: InterClientMessageType.MediaChange,
            Content: JSON.stringify(newPermissions),
            TimeStampUtc: (new Date()).toISOString()
        };

        WebRTCService.sendPeerMessage(message);
    }, []);

    const toggleMedia = useCallback((permissions: MediaKind) => {
        let newPermissions: any = undefined;
        if (permissions.audio)
            setMediaPermissions(prevState => {
                newPermissions = { ...prevState, audio: !prevState.audio };
                return newPermissions;
            })
        else if (permissions.video)
            setMediaPermissions(prevState => {
                newPermissions = { ...prevState, video: !prevState.video };
                return newPermissions;
            });

    }, [setMediaPermissions])

    useEffect(() => {
        if (!localStream)
            return;

        localStream.getAudioTracks().forEach(x => x.enabled = mediaPermissions.audio!);
        localStream.getVideoTracks().forEach(x => x.enabled = mediaPermissions.video!);

        sendPermissions(mediaPermissions);
    }, [mediaPermissions]);

    function changeValue(value: number) {
        const modifiedStream = modifyVolumeStream(localStream, value);
        WebRTCService.replaceTracks(modifiedStream, { audio: true })
    }

    return (
        <div className="flex-1 flex flex-col max-h-full h-full items-center justify-center bg-gray-900">
            <Caller contact={callerChat.contact} stream={remoteStream} controls={true} userAudio={true} userVideo={false} />
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
                <VolumeSlider defaultValue={100} onChange={changeValue} />
            </div>
            {mediaPermissions.video! && <Caller userAudio={false} userVideo={mediaPermissions.video!} stream={localStream} controls={false} />}
        </div >
    )
}

function VolumeSlider({ defaultValue, onChange }: { defaultValue: number; onChange: (value: number) => void }) {
    return (
        <div className="flex items-center space-x-2 bg-gray-800 rounded-full p-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
                defaultValue={[defaultValue]}
                onValueChange={(newValue) => onChange(newValue[0])}
                max={200}
                step={1}
                className="w-32"
            />
        </div>
    )
}