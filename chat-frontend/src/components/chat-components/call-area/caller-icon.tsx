import { InterClientConnection } from "@/ApiServices/WebRTC/InterClientConnection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VolumeSlider } from "@/components/ui/volume-slider";
import { useService } from "@/customHooks/useService";
import { ContactModel } from "@/models/Contact";
import { MediaKind } from "@/models/MediaKind";
import { ContentMessage, MessageType } from "@/models/Message";
import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Media } from "../../../lib/media";

export function CallerIcon({ connection, media, userAudio, userVideo, controls }
    : { connection?: InterClientConnection | undefined, userVideo?: boolean, userAudio: boolean, media: Media, controls: boolean }) {

    const [isAudio, setIsAudio] = useState<boolean>(userAudio);
    const [showVideo, setShowVideo] = useState<boolean>(true || (media.hasTracks({ video: true })));
    const videoRef = useRef<HTMLVideoElement>(null);
    const contact = connection?.contact;

    useEffect(() => {
        videoRef.current!.srcObject = media.stream;

        if (media)
            media.stream.addEventListener('addtrack', (ev: MediaStreamTrackEvent) => {
                setShowVideo(media.hasTracks({ video: true }));
            })
    }, [showVideo, media])

    useEffect(() => {
        if (!connection)
            return;

        const updateInputTracks = (message: ContentMessage) => {
            if (message.Type === MessageType.MediaChange && message.Content) {
                const kind = JSON.parse(message.Content) as MediaKind;
                setIsAudio(kind.audio!);
                setShowVideo(kind.video!);
            }
        }

        connection.onMessage.push(updateInputTracks as any);

        () => { connection.onMessage.remove(updateInputTracks as any); }
    }, []);


    return (
        <div className="m-4 flex flex-col items-center">
            {contact && <h2 className="text-base sm:text-lg md:text-1xl lg:text-2xl xl:text-4xl font-bold text-gray-100">{contact.Name}</h2>}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={!isAudio}
                className={`${!showVideo && 'hidden'} bg-black w-full`}

            />
            {contact && (!showVideo) && <Avatar>
                <AvatarImage src={contact.AvatarSrc} alt={contact.Name} />
                <AvatarFallback>{contact.Name?.slice(0, 2)}</AvatarFallback>
            </Avatar>}
            <VolumeSlider defaultValue={0.5} max={1} onChange={(volume) => videoRef.current!.volume = volume} />
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