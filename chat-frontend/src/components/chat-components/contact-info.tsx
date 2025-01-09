import { Chat } from "@/models/Chat";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAppDispatch } from "@/store/hooks";
import { selectCaller } from "@/store/slice";
import { useService } from "@/customHooks/useService";
import { ConnectionManager } from "@/ApiServices/WebRTC/ConnectionManager";

export function ContactInfo({ selectedChat, isInCall }: { selectedChat: Chat, isInCall: boolean }) {
    const dispatch = useAppDispatch();

    const interClientConnection = useService(ConnectionManager);

    async function startCall() {
        if (!selectedChat)
            return;

        interClientConnection
            .startCall(selectedChat)
            .then(isConntected => {
                if (!isConntected)
                    dispatch(selectCaller(null));
            });

        dispatch(selectCaller(selectedChat));
    }

    return (
        <div className="p-4 border-b flex items-center justify-between border-gray-700 h-min">
            <div className="flex items-center">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChat.contact.AvatarSrc} alt={selectedChat.contact.Name} />
                    <AvatarFallback>{selectedChat.contact.Name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h2 className="ml-4 font-semibold text-gray-100">{selectedChat.contact.Name}</h2>
            </div>
            {!isInCall && <button className="inset-y-0 right-0 w-16" onClick={() => startCall()}>Call</button>}
        </div>)
}