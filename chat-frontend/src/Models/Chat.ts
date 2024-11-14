import { Contact } from "./Contact";
import { ChatMessage } from "./Message";

export type Chat = { contact: Contact, messages: ChatMessage[] | null, participants: Contact[] | null, isLoaded: boolean }
