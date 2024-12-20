'use client'

import { Chat } from "@/Models/Chat";
import { Contact } from "@/Models/Contact";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Search, Phone, Video, Mic, MicOff, PhoneOff, Camera, CameraOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from "react";
import { WebRTCService } from "@/ApiServices/WebRTC/WebRTC";

export default function CallArea({ chat, stopCall }: { chat: Chat, stopCall: () => void }) {
    const selectedContact = chat.contact;
    const [localStream, setLocalStream] = useState<MediaStream>();
    const [remoteStream, setRemoteStream] = useState<MediaStream>();

    const [isAudio, setIsAudio] = useState(true);
    const [isVideo, setIsVideo] = useState(true);

    const stopMedia = useCallback(() => {
        if (localStream)
            localStream.getTracks().forEach((track) => track.stop());

        console.log("Screen sharing stopped.");

    }, [localStream]);

    useEffect(() => {
        const tasks: Promise<MediaStream | RTCPeerConnection | null>[] = [];

        tasks.push(getLocalMedia());

        tasks.push(WebRTCService.startConnection(chat.contact));

        Promise
            .all(tasks)
            .then((results) => {
                const [stream, connection] = results;

                setLocalStream(localStream);

                if (!connection)
                    return;

                (connection as RTCPeerConnection).ontrack = event => {
                    event.streams[0]
                        .getTracks()
                        .forEach(track => {
                            remoteStream?.addTrack(track);
                        });
                }

                if (stream) {
                    (stream as MediaStream)
                        .getTracks()
                        .forEach((track) => {
                            connection.addTrack(track);
                        })
                }
                else {
                    setIsAudio(false);
                    setIsVideo(false);
                }

            });


        () => {
            stopMedia();
        }
    }, []);

    const contacts = chat.participants;

    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 border-gray-700 border-r">
            <Caller defaultIsAudio={false} defaultIsVideo={isVideo} stream={localStream} controls={true} />

            {/*LocalCaller */}
            <Caller defaultIsAudio={false} defaultIsVideo={isVideo} stream={localStream} controls={false} />
            <div className="space-x-4">
                <Button variant="ghost" size="icon" onClick={() => setIsAudio(prevState => !prevState)}>
                    {isAudio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsVideo(prevState => !prevState)}>
                    {isVideo ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </Button>
                <Button variant="destructive" size="icon" >
                    <PhoneOff className="h-4 w-4" onClick={() => { stopMedia(); stopCall(); }} />
                </Button>
            </div>
        </div>
    )
}

function Caller({ contact, stream, defaultIsAudio, defaultIsVideo, controls }
    : { contact?: Contact | undefined, defaultIsVideo: boolean, defaultIsAudio: boolean, stream: MediaStream | undefined, controls: boolean }) {

    const [isAudio, setIsAudio] = useState(defaultIsAudio);
    const [isVideo, setIsVideo] = useState(defaultIsVideo);
    const videoRef = useRef<HTMLVideoElement>(null);

    const showVideo = isVideo && stream;

    useEffect(() => {
        if (isVideo && stream)
            videoRef.current!.srcObject = stream;
    }, [isVideo, stream])

    return (
        <div className="m-4">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={!isAudio}
                className={`w-full h-full ${!showVideo && 'hidden'}`}
            />
            {contact && (!isVideo || !stream) && <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Avatar className="w-full h-full">
                    <AvatarImage src={contact.AvatarSrc} alt={contact.Name} />
                    <AvatarFallback>{contact.Name.slice(0, 2)}</AvatarFallback>
                </Avatar>
            </div>}
            <div className="space-x-4">
                <Button variant="ghost" size="icon" onClick={() => setIsAudio(prevState => !prevState)}>
                    {isAudio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsVideo(prevState => !prevState)}>
                    {isVideo ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}

async function getLocalMedia() {
    let localStream = null;
    try {
        localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    } catch (err) {
        console.error(err);
    }

    return localStream;
}
