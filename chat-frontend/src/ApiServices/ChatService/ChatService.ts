import { CHATS } from "@/apiPaths";
import { ApiService } from "../ApiService";
import { Contact, FixContactType } from "@/Models/Contact";
import { ChatMessage } from "@/Models/Message";
import { Chat } from "@/Models/Chat";

export class ChatService {

    static async LoadChatContact(chatId: number): Promise<Contact | null> {
        const path = CHATS.CHATS_PATH + `?chatId=${chatId}`;
        const response = await ApiService.GET<Contact>(path);

        if (response)
            FixContactType(response);

        return response;
    }

    static async loadContacts(nameFilter?: string): Promise<Contact[]> {
        const path = CHATS.SEARCH_CONTACTS_PATH + (nameFilter !== undefined ? `?name=${nameFilter}` : '');
        const response = await ApiService.GET<Contact[]>(path) ?? [];

        response.forEach(x => FixContactType(x))
        return response;
    }

    static async LoadMessages(chatId: number): Promise<ChatMessage[]> {
        const path = CHATS.CHAT_MESSAGES_PATH + `?chatId=${chatId}`;
        const response = await ApiService.GET<ChatMessage[]>(path) ?? [];
        return response;
    }

    static async LoadParticipantsInChat(chatId: number): Promise<Contact[]> {
        const path = CHATS.SEARCH_CONTACTS_PATH + `?chatId=${chatId}`;
        const response = await ApiService.GET<Contact[]>(path) ?? [];

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
}