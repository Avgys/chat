import { ChatPage } from "@/components/component/chat-page";
import { DarkChatPageComponent } from "@/components/component/dark-chat-page";
import Image from "next/image";

export default function Chat() {

  return (
    <main className="justify-center">
      <DarkChatPageComponent></DarkChatPageComponent>
    </main>
  );
}
