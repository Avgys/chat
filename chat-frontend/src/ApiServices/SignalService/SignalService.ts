
import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { AuthService } from "../AuthService/AuthService";

import URLS from "@/urls";
import { ChatMessage, MessageType } from "@/Models/Message";
import { SDPMessage } from "@/Models/SDPMessage";
import { CHAT_HUB } from "@/apiPaths";

export class SignalService {
    private static currentConnection: HubConnection | null;

    public static onMessageReceive: ((newMessage: ChatMessage) => void) | null = null;

    public static onOfferReceive: ((offer: SDPMessage) => Promise<SDPMessage>) | null = null;
    public static onIceCandidateOffer: ((offer: ChatMessage) => void) | null = null;

    static async connectToServer() {
        console.debug('initiating ws connection');

        this.currentConnection = new HubConnectionBuilder()
            .withUrl(URLS.SIGNAL_URL + CHAT_HUB.HUB_PATH,
                {
                    accessTokenFactory: () => AuthService.GetTokenAsync().then(token => token ?? ''),
                    //skipNegotiation: true,
                    //withCredentials: true,
                    transport: HttpTransportType.WebSockets,
                })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        this.SetHandlers(this.currentConnection);

        try {
            await this.currentConnection.start();
            console.debug("SignalR Connected.");
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    static SetHandlers(connection: HubConnection) {
        connection.on('ReceiveMessage', (data: any) => this.RouteMessage(data));
        connection.on('ReceiveOffer', async (data: any) => { return this.onOfferReceive && this.onOfferReceive(data) });

        connection.onclose(async () => {
            console.error('SignalR connection close');
        });
    }

    static RouteMessage(newMessage: ChatMessage) {
        if (newMessage.Type == MessageType.Message) {
            this.onMessageReceive && this.onMessageReceive(newMessage);
        }
        else if (newMessage.Type == MessageType.IceCandidate) {
            this.onIceCandidateOffer && this.onIceCandidateOffer(newMessage);
        }
    }

    public static async sendRequest<T>(methodName: string, data: any) {
        try {
            return await this.currentConnection?.invoke<T>(methodName, data);
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }
}