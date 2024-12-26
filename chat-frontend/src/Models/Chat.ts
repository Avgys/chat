import { ContactModel } from "./Contact";
import { ChatMessage } from "./Message";

export type Chat = { contact: ContactModel, messages: ChatMessage[] | null, participants: ContactModel[] | null, isLoaded: boolean }
