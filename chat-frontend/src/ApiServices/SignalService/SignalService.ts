import URLConsts from "@/URLConsts";
import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { AuthService } from "../AuthService/AuthService";

export class SignalService {
    static async init() {
        console.log('initiating ws connection');

        const token = await AuthService.getTokenAsync();
        if (!token)
            return false;

        const connection = new HubConnectionBuilder()
            .withUrl(URLConsts.HUB_PATH, {
                accessTokenFactory: () => token,
                transport: HttpTransportType.WebSockets
            })
            .configureLogging(LogLevel.Information)
            .build();

        this.setHandlers(connection);

        async function start() {
            try {
                await connection.start();
                console.log("SignalR Connected.");
            } catch (err) {
                console.log(err);
                setTimeout(start, 5000);
            }
        };

        connection.onclose(async () => {
            await start();
        });

        try {
            start();
        }
        catch(e){
            console.log(e);
        }
        finally{
            return true;
        }
    }

    static setHandlers(connection: HubConnection) {
        connection.on('message', onMessage)
    }
}

function onMessage(...data: any[]) {
    console.log('Data: ', JSON.stringify(data));
}