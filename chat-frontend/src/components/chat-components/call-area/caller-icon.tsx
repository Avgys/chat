import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ContactModel } from "@/Models/Contact";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Caller({ contact, stream, userAudio, userVideo, controls }
    : { contact?: ContactModel | undefined, userVideo?: boolean, userAudio?: boolean, stream: MediaStream | undefined, controls: boolean }) {

    const [isAudio, setIsAudio] = useState(userAudio ?? true);
    const [isVideo, setIsVideo] = useState(userVideo ?? true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const showVideo = isVideo && stream;

    useEffect(() => {

        if (stream) {
            const videoTracks = stream!.getAudioTracks().length;
            const audioTracks = stream!.getAudioTracks().length;
            stream.onaddtrack = (ev) => {
                setIsAudio(stream!.getAudioTracks().length > 0);
                setIsVideo(stream!.getVideoTracks().length > 0);
            };
        }

        if (isVideo && stream)
            videoRef.current!.srcObject = stream;
    }, [isVideo, stream])

    return (
        <div className="m-4 w-full flex flex-col items-center">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isAudio}
                className={`w-full ${!showVideo && 'hidden'} bg-black`}
            />
            {contact && (!showVideo) &&
                <Avatar>
                    <AvatarImage src={contact.AvatarSrc} alt={contact.Name} />
                    <AvatarFallback>{contact.Name.slice(0, 2)}</AvatarFallback>
                </Avatar>
            }
            {controls && (<span className="flex justify-center m-4 w-full">
                <Button variant="ghost" size="icon" onClick={() => setIsAudio(prevState => !prevState)}>
                    {isAudio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsVideo(prevState => !prevState)}>
                    {isVideo ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </Button>
            </span>)}
        </div>
    )
}