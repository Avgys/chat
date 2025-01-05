import { CHAT_HUB, CHATS } from "@/apiPaths";
import { ApiService } from "../ApiService";
import { ContactModel, FixContactType } from "@/Models/Contact";
import { ContentMessage, MessageType } from "@/Models/Message";
import { Chat } from "@/Models/Chat";
import { SignalService } from "../SignalService/SignalService";
import { AuthService } from "../AuthService/AuthService";

export class ChatService {

    static async LoadChatContact(chatId: number): Promise<ContactModel | null> {
        const path = CHATS.CHATS_PATH + `?chatId=${chatId}`;
        const response = await ApiService.GET<ContactModel>(path);

        if (response)
            FixContactType(response);

        return response;
    }

    static async loadContacts(nameFilter?: string): Promise<ContactModel[]> {
        const path = CHATS.SEARCH_CONTACTS_PATH + (nameFilter !== undefined ? `?name=${nameFilter}` : '');
        const response = await ApiService.GET<ContactModel[]>(path) ?? [];

        response.forEach(x => FixContactType(x))
        return response;
    }

    static async LoadMessages(chatId: number): Promise<ContentMessage[]> {
        const path = CHATS.CHAT_MESSAGES_PATH + `?chatId=${chatId}`;
        const response = await ApiService.GET<ContentMessage[]>(path) ?? [];
        return response;
    }

    static async LoadParticipantsInChat(chatId: number): Promise<ContactModel[]> {
        const path = CHATS.CHAT_PARTICIPANTS_PATH + `?chatId=${chatId}`;
        const response = await ApiService.GET<ContactModel[]>(path) ?? [];

        response.forEach(x => FixContactType(x));
        return response;
    }

    static async LoadChat(chatId: number): Promise<Chat> {

        const promises: Promise<any>[] = [
            ChatService.LoadParticipantsInChat(chatId),
            ChatService.LoadMessages(chatId),
            (ChatService.LoadChatContact(chatId))!
        ];

        const [participants, messages, conctact] = await Promise.all(promises);

        return {
            messages: messages,
            participants: participants,
            contact: conctact,
            isLoaded: true
        };
    }

    public static async sendMessage(messageText: string, contact: ContactModel) {
        const message: ContentMessage = {
            Contact: contact,
            Content: messageText,
            TimeStampUtc: (new Date()).toISOString(),
            Type: MessageType.Message,
            SenderId: Number((await AuthService.GetTokenInfoAsync())!.UserId),
        };

        const isMessageReceived = SignalService.sendRequest(CHAT_HUB.SEND_MESSAGE_METHOD, message)
            .then(x => x?.Content === message.Content);

        return { message, isMessageReceived };
    }
}