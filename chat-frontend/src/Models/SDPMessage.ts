import { ContactModel } from "./Contact";

export interface SDPMessage {
    Contact: ContactModel;
    Content: string
}