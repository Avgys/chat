'use client'

import { Chat } from "@/Models/Chat";
import { Button } from "../../ui/button";
import { Mic, MicOff, PhoneOff, Camera, CameraOff, Volume2 } from 'lucide-react'
import {  useEffect, useState } from "react";
import { WebRTCService } from "@/ApiServices/WebRTC/WebRTC";
import { Slider } from "../../ui/slider";
import { Caller } from "./caller-icon";
import { modifyVolumeStream, getLocalMedia } from "@/lib/utils";

export default function VoiceChat({ callerChat, stopCall, localStream, remoteStream }
    : {
        callerChat: Chat
        , stopCall: () => void
        , localStream: MediaStream
        , remoteStream: MediaStream
    }) {

    const [isAudio, setIsAudio] = useState(true);
    const [isVideo, setIsVideo] = useState(true);

    useEffect(() => {
        if (!localStream)
            return;

        localStream.getAudioTracks().forEach(x => x.enabled = isAudio);
        localStream.getVideoTracks().forEach(x => x.enabled = isVideo);
    }, [isAudio, isVideo]);

    function changeValue(value: number) {
        const modifiedStream = modifyVolumeStream(localStream, value);
        WebRTCService.replaceTracks(modifiedStream, { audio: true })
    }

    return (
        <div className="flex-1 flex flex-col h-full items-center justify-center bg-gray-900">
            <Caller contact={callerChat.contact} stream={remoteStream} controls={true} />
            {/*LocalCaller */}
            <div className="space-x-4 m-y-16">
                <Button variant="ghost" size="icon" onClick={() => setIsAudio(prevState => !prevState)}>
                    {isAudio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsVideo(prevState => !prevState)}>
                    {isVideo ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </Button>
                <Button variant="destructive" size="icon" onClick={stopCall} >
                    <PhoneOff className="h-4 w-4"/>
                </Button>
            </div>
            <VolumeSlider defaultValue={100} onChange={changeValue} />
            <Caller userAudio={false} userVideo={isVideo} stream={localStream} controls={false} />
        </div>
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