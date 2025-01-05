import { ContactModel } from "./Contact";

export interface Message {
    Id?: number;
    Contact: ContactModel;
    Type: MessageType | InterClientMessageType;
    SenderId?: number;
    TimeStampUtc: string;
}

export interface ContentMessage extends Message {
    Content: string;
}

export enum MessageType {
    'Message',
    'IceCandidate',
    'Offer',
    'Answer',
    'CloseConnection',
}

export enum InterClientMessageType {
    'Connected',
    'Disconnected', 
    'Inform',
    'MediaChange'
}