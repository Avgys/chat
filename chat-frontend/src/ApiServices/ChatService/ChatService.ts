import { CHATS } from "@/env";
import { ApiService } from "../ApiService";
import { Contact } from "@/Models/Contact";

export class ChatService {
    static async LoadContacts() {
        const response = await ApiService.GET<Contact[]>(CHATS.MY_CONTACTS_PATH) ?? [];

        response.forEach(x => x.AvatarSrc = 'face.jpeg')
        return response;
    }
}