'use client'

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Phone, PhoneOff, Camera } from 'lucide-react'
import { MediaKind } from "../../../models/MediaKind";
import { ContactModel } from "@/models/Contact";

export default function AnswerCall({ callingContact, answer: answerCallback }: { callingContact: ContactModel, answer: (pesmissions: MediaKind) => void }) {
   
    return callingContact && (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 max-h-full">
            <Avatar className="m-4">
                <AvatarImage src={'face.jpeg'} alt={callingContact.Name} />
                <AvatarFallback>{callingContact.Name?.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <h2 className="text-base sm:text-lg md:text-2xl lg:text-4xl xl:text-6xl font-bold text-gray-100">
                {callingContact.Name}
            </h2>
            <div className="space-x-4">
                <Button variant="ghost" size="icon" onClick={() => answerCallback({ audio: true, video: true })}>
                    <Camera className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => answerCallback({ audio: true, video: false })}>
                    <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => answerCallback({ audio: false, video: false })}>
                    <PhoneOff className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}