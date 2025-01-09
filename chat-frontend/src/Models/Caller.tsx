import { InterClientConnection } from "@/ApiServices/WebRTC/InterClientConnection";
import { ContactModel } from "@/models/Contact";
import { Media } from "@/lib/media";

export type Caller = {
  contact: ContactModel;
  connection: InterClientConnection;
};
