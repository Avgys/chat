import { WebRTCService } from "@/ApiServices/WebRTC/WebRTC";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ContactModel } from "@/Models/Contact";
import { MediaKind } from "@/Models/MediaKind";
import { ContentMessage, InterClientMessageType } from "@/Models/Message";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export function Caller({ contact, stream, userAudio, userVideo, controls }
    : { contact?: ContactModel | undefined, userVideo: boolean, userAudio: boolean, stream: MediaStream | undefined, controls: boolean }) {

    const [isAudio, setIsAudio] = useState<boolean>(userAudio);
    const [showVideo, setShowVideo] = useState<boolean>(userVideo || ((stream?.getVideoTracks().length ?? 0) > 0));
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        videoRef.current!.srcObject = stream ?? null;

        if (stream)
            stream.onaddtrack = (ev: MediaStreamTrackEvent) => {
                setShowVideo(stream?.getVideoTracks().length > 0);
            }
    }, [showVideo, stream])

    useEffect(() => {
        if (!contact)
            return;

        const func = (message: ContentMessage) => {
            if (message.Type === InterClientMessageType.MediaChange && message.Content) {
                const kind = JSON.parse(message.Content) as MediaKind;

                setIsAudio(kind.audio!);
                setShowVideo(kind.video!);
            }
        }

        WebRTCService.onPeerMessageReceive.push(func as any);

        () => {
            WebRTCService.onPeerMessageReceive.splice(WebRTCService.onPeerMessageReceive.indexOf(func as any));
        }
    }, []);


    return (
        <div className="m-4 flex flex-col items-center">
            {contact && <h2 className="text-base sm:text-lg md:text-1xl lg:text-2xl xl:text-4xl font-bold text-gray-100">{contact.Name}</h2>}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={!isAudio}
                className={`${!showVideo && 'hidden'} bg-black`}
            />
            {contact && (!showVideo) && <Avatar>
                <AvatarImage src={contact.AvatarSrc} alt={contact.Name} />
                <AvatarFallback>{contact.Name?.slice(0, 2)}</AvatarFallback>
            </Avatar>}
            {controls && (<span className="flex justify-center m-4 w-full">
                <Button variant="ghost" size="icon" onClick={() => setIsAudio(prevState => !prevState)}>
                    {isAudio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                {/* <Button variant="ghost" size="icon" onClick={() => setIsVideo(prevState => !prevState)}>
                    {isVideo ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </Button> */}
            </span>)}
        </div>
    )
}