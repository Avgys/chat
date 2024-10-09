import URLConsts from "@/URLConsts";
import { ApiService } from "../ApiService";
import { Contact } from "@/Models/Contact";

export class ChatService {
    static async LoadContacts(){
        const response = await ApiService.GET<Contact[]>(URLConsts.CHATS_PATH, true) ?? [];

        response.forEach(x => x.AvatarSrc = 'face.jpeg')
        return response;
    }
}