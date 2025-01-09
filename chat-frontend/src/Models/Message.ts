import { ContactModel } from "./Contact";

export interface Message {
    Id?: number;
    Contact: ContactModel;
    Sender?: ContactModel;
    Type: MessageType;
    TimeStampUtc: string;
}

export interface ContentMessage extends Message {
    Content: string;
}

export enum MessageType {
    'ChatMessage',
    'IceCandidate',
    'Offer',
    'Answer',
    'CloseConnection',
    'MediaChange',
    'Connected'
}