
import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { AuthService } from "../AuthService/AuthService";
import { HUBS } from "@/env";
import ENV from "@/env.urls";
import { ChatMessage } from "@/Models/Message";

export class SignalService {
    private static CurrentConnection: HubConnection | null;

    public static OnReceiveMessage: ((newMessage: ChatMessage) => void)[] = [];

    static async Init() {
        console.log('initiating ws connection');

        this.CurrentConnection = new HubConnectionBuilder()
            .withUrl(ENV.BACKEND_URL + HUBS.HUB_PATH,
                {
                    accessTokenFactory: () => AuthService.GetTokenAsync().then(token => token ?? ''),
                    transport: HttpTransportType.WebSockets,
                })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();


        this.SetHandlers(this.CurrentConnection);

        async function start(connection: HubConnection) {
            try {
                await connection.start();
                console.log("SignalR Connected.");
            } catch (err) {
                console.log(err);
            }
        };

        try {
            start(this.CurrentConnection);
        }
        catch (e) {
            console.log(e);
        }
        finally {
            return true;
        }
    }

    static SetHandlers(connection: HubConnection) {
        connection.on('ReceiveMessageAsync', SignalService.ReceiveMessage);

        connection.onclose(async () => {
            console.error('SignalR connection close');
        });
    }

    static ReceiveMessage(data: ChatMessage) {
        console.log('Data: ', JSON.stringify(data));
        SignalService.OnReceiveMessage.forEach(element => element.call(null, data));
    }

    static async SendMessage(messageText: string, receiverId: number, isChat: boolean): Promise<number> {
        const sendMessage: string = isChat ? 'SendChatMessage' : 'SendDirectMessage';

        const message: any = { Text: messageText, TimeStampUtc: new Date() };
        
        if (isChat)
            message.ChatId = receiverId;
        else
            message.ReceiverId = receiverId;

        return await this.CurrentConnection?.invoke<number>(sendMessage, message) ?? -1;
    }

    static JoinChat() {

    }
}
