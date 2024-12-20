export interface MessageBase {
    Id?: number;
    Content: string;
    Type: MessageType;
    SenderId?: number;
    TimeStampUtc: string;
}

export interface ChatMessage extends MessageBase {
    ChatId: number;
}

export interface DirectMessage extends MessageBase {
    ReceiverId: number;
}

export enum MessageType {
    'Message',
    'IceCandidate'
}