
import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { AuthService } from "../AuthService/AuthService";

import URLS from "@/urls";
import { ContentMessage, Message, MessageType } from "@/Models/Message";
import { CHAT_HUB } from "@/apiPaths";

export class SignalService {
    private static currentConnection: HubConnection | null;

    public static onMessageReceive: ((newMessage: ContentMessage) => void) | null = null;

    public static onOfferReceive: ((offer: ContentMessage) => Promise<ContentMessage>) | null = null;
    public static onRemoteIceCandidateOffer: ((offer: ContentMessage) => void) | null = null;

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
        connection.on('receivemessage', (data: any) => this.RouteMessage(data));
        connection.on('receiverequest', async (data: any) => { return this.onOfferReceive && this.onOfferReceive(data) });

        connection.onclose(async () => {
            console.error('SignalR connection close');
        });
    }

    static RouteMessage(newMessage: ContentMessage) {
        if (newMessage.Type == MessageType.Message && this.onMessageReceive) {
            this.onMessageReceive(newMessage);
        }
        else if (newMessage.Type == MessageType.IceCandidate && this.onRemoteIceCandidateOffer) {
            this.onRemoteIceCandidateOffer(newMessage);
        }
    }

    public static async sendRequest(methodName: string, data: Message): Promise<ContentMessage | null> {
        if (!this.currentConnection) {
            await this.connectToServer();
        }

        try {
            return await this.currentConnection!.invoke<ContentMessage>(methodName, data);
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }
}

function useSignalService() {

}