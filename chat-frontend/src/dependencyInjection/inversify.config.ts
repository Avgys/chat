import { Container } from "inversify";
import { ApiService } from "@/ApiServices/ApiService";
import { AuthService } from "@/ApiServices/AuthService/AuthService";
import { ChatService } from "@/ApiServices/ChatService/ChatService";
import { SignalConnection } from "@/ApiServices/SignalService/SignalService";
import { ConnectionManager } from "@/ApiServices/WebRTC/ConnectionManager";
import { store } from "@/store/store";
import { TYPES } from "./types";

const container = new Container();

container.bind(ApiService).toSelf().inSingletonScope();
container.bind(AuthService).toSelf().inSingletonScope();
container.bind(ChatService).toSelf().inSingletonScope();
// container.bind(InterClientConnection).toSelf().inSingletonScope();
container.bind(SignalConnection).toSelf().inSingletonScope();
container.bind(ConnectionManager).toSelf().inSingletonScope();
container.bind(TYPES.Store).toConstantValue(store);

export { container };