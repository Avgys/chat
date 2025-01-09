
import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { AuthService } from "../AuthService/AuthService";

import URLS from "@/urls";
import { ContentMessage, Message, MessageType } from "@/models/Message";
import { CHAT_HUB } from "@/apiPaths";
import { inject, injectable } from "inversify";

@injectable()
export class SignalConnection {
    private currentConnection: HubConnection | undefined;

    public onMessageReceive: ((newMessage: ContentMessage) => void) | null = null;

    public OnRemoteClientRequest: ((offer: ContentMessage) => Promise<Message | ContentMessage>) | null = null;
    public onRemoteClientMessage: ((offer: ContentMessage) => void) | null = null;

    public constructor(@inject(AuthService) private authService: AuthService) {
    }

    async connectToServer() {
        console.debug('initiating ws connection');

        this.currentConnection = new HubConnectionBuilder()
            .withUrl(URLS.SIGNAL_URL + CHAT_HUB.HUB_PATH,
                {
                    accessTokenFactory: () => this.authService
                        .getTokenAsync()
                        .then(x => x?.source ?? ''),
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

    SetHandlers(connection: HubConnection) {
        connection.on('receivemessage', (data: any) => this.RouteMessage(data));
        connection.on('receiverequest', async (data: any) => { return this.RouteRequest(data) });

        connection.onclose(async () => {
            console.error('SignalR connection close');
        });
    }

    RouteMessage(newMessage: ContentMessage) {
        if (newMessage.Type == MessageType.ChatMessage && this.onMessageReceive) {
            this.onMessageReceive(newMessage);
        }
        else if ((newMessage.Type === MessageType.IceCandidate
            || newMessage.Type === MessageType.CloseConnection)
            && this.onRemoteClientMessage) {
            this.onRemoteClientMessage(newMessage);
        }
    }

    RouteRequest(newMessage: ContentMessage) {
        if (newMessage.Type == MessageType.Offer && this.OnRemoteClientRequest) {
            return this.OnRemoteClientRequest(newMessage);
        }

        return null;
    }

    public async sendRequest(methodName: string, data: Message): Promise<ContentMessage | null> {
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