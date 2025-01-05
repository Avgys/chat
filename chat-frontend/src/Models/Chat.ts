import { ContactModel } from "./Contact";
import { ContentMessage } from "./Message";

export type Chat = { contact: ContactModel, messages: ContentMessage[] | null, participants: ContactModel[] | null, isLoaded: boolean }
