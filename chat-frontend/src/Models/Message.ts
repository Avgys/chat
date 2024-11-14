export interface MessageBase {
    Id?: number;
    Text: string;
    SenderId?: number;
    TimeStampUtc: string;
}

export interface DirectMessage extends MessageBase {
    ReceiverId: number;
}

export interface ChatMessage extends MessageBase {
    ChatId: number;    
}