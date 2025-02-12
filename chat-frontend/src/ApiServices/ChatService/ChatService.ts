import { CHAT_HUB, CHATS } from "@/apiPaths";
import { ApiService } from "../ApiService";
import { ContactModel, FixContactType } from "@/models/Contact";
import { ContentMessage, MessageType } from "@/models/Message";
import { Chat } from "@/models/Chat";
import { AuthService } from "../AuthService/AuthService";
import { inject, injectable } from "inversify";
import { SignalConnection } from "../SignalService/SignalService";

@injectable()
export class ChatService {
    constructor(
        @inject(ApiService) private apiService: ApiService,
        @inject(SignalConnection) private signalConnection: SignalConnection,
        @inject(AuthService) private authService: AuthService
    ) { }

    async LoadChatContact(chatId: number): Promise<ContactModel | null> {
        const path = CHATS.CHATS_PATH + `?chatId=${chatId}`;
        const response = await this.apiService.GET<ContactModel>(path);

        if (response)
            FixContactType(response);

        return response;
    }

    async loadContacts(nameFilter?: string): Promise<ContactModel[]> {
        const path = CHATS.SEARCH_CONTACTS_PATH + (nameFilter !== undefined ? `?name=${nameFilter}` : '');
        const response = await this.apiService.GET<ContactModel[]>(path) ?? [];

        response.forEach(x => FixContactType(x))
        return response;
    }

    async LoadMessages(chatId: number): Promise<ContentMessage[]> {
        const path = CHATS.CHAT_MESSAGES_PATH + `?chatId=${chatId}`;
        const response = await this.apiService.GET<ContentMessage[]>(path) ?? [];
        return response;
    }

    async LoadParticipantsInChat(chatId: number): Promise<ContactModel[]> {
        const path = CHATS.CHAT_PARTICIPANTS_PATH + `?chatId=${chatId}`;
        const response = await this.apiService.GET<ContactModel[]>(path) ?? [];

        response.forEach(x => FixContactType(x));
        return response;
    }

    async LoadChat(chatId: number): Promise<Chat> {

        const promises: Promise<any>[] = [
            this.LoadParticipantsInChat(chatId),
            this.LoadMessages(chatId),
            (this.LoadChatContact(chatId))!
        ];

        const [participants, messages, conctact] = await Promise.all(promises);

        return {
            messages: messages,
            participants: participants,
            contact: conctact,
            isLoaded: true
        };
    }

    public async sendMessage(messageText: string, contact: ContactModel): Promise<{ message: ContentMessage, isMessageReceived: boolean }> {
        const userToken = await this.authService.getTokenAsync();
        const senderId = userToken?.UserId ?? null;

        const message: ContentMessage = {
            Contact: contact,
            Content: messageText,
            TimeStampUtc: (new Date()).toISOString(),
            Type: MessageType.ChatMessage,
            Sender: { UserId: Number(senderId) },
        };

        // const isMessageReceived = this.signalConnection.sendRequest(CHAT_HUB.SEND_MESSAGE_METHOD, message)
        //     .then(x => x?.Content === message.Content);

        const sdf = await this.apiService.POST<boolean>(CHATS.SEND_MESSAGE, message);

        return { message, isMessageReceived: true };
    }
}