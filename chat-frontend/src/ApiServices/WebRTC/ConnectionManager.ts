import { inject, injectable, preDestroy } from "inversify";
import { SignalConnection } from "../SignalService/SignalService";
import { ContactModel } from "@/models/Contact";
import { InterClientConnection } from "./InterClientConnection";
import { ContentMessage, Message, MessageType } from "@/models/Message";
import { Chat } from "@/models/Chat";
import { CHAT_HUB } from "@/apiPaths";
import { Media } from "@/lib/media";
import { ChatService } from "../ChatService/ChatService";
import { MediaKind } from "@/models/MediaKind";
import { findChatByContact, selectCaller, updateOrAddChat } from "@/store/slice";
import { TYPES } from "@/dependencyInjection/types"
import type { AppStore } from "@/store/store";

@injectable()
export class ConnectionManager {

    static isStun = 'true' === process.env.NEXT_PUBLIC_WEBRTC_STUN;
    static readonly servers = {
        iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.l.google.com:5349'] }],
        iceCandidatePoolSize: 10
    };

    static getStunServers() {
        return ConnectionManager.isStun
            ? ConnectionManager.servers
            : undefined;
    }

    public connections: InterClientConnection[] = [];

    getUserCallAccept: ((contact: ContactModel) => Promise<MediaKind>) | null = null;
    onConnecting?: (localMedia: Media, remoteCallers: InterClientConnection[]) => void
    onConnected?: (localMedia: Media, remoteCallers: InterClientConnection[]) => void;
    onClosed?: () => void;
    onStateChange?: (state: string) => void;

    //onPeerMessageReceive: ((message: Message | ContentMessage) => void)[] = [];

    currentChatCaller?: Chat;
    state: RTCPeerConnectionState = 'new';

    public constructor(
        @inject(SignalConnection) private signalConnection: SignalConnection,
        @inject(ChatService) private chatService: ChatService,
        @inject(TYPES.Store) private store: AppStore) {

        this.signalConnection.OnRemoteClientRequest = (message) => this.dispatchRequest(message);
        this.signalConnection.onRemoteClientMessage = (message) => this.dispatchInterClientMessage(message);
    }

    async dispatchRequest(offerMessage: ContentMessage): Promise<Message> {
        console.log("Received signal request: " + offerMessage);

        if (offerMessage.Type === MessageType.Offer)
            return this.acceptOffer(offerMessage);

        return offerMessage;
    }

    dispatchInterClientMessage(message: Message) {
        console.log("Received signal message: " + message);

        if (message.Type === MessageType.CloseConnection) {
            //Close connection with contact from message
            this.endCall();
        }
        else if (message.Type === MessageType.IceCandidate) {
            // Candidate to connection for contact
            this.addRemoteIceCandidates(message)
        }

        // this.onPeerMessageReceive.forEach(func => {
        //     try {
        //         func(message);
        //     }
        //     catch (e) {
        //         console.log(func.name + ' raised exception: ' + e);
        //     }
        // });
    }

    async startCall(chat: Chat) {
        if (this.currentChatCaller)
            throw new Error("Another call in process");

        this.currentChatCaller = chat;

        const connection = await this.createConnection(chat.contact);

        const offer = await connection.createSDP("offer");

        const offerMessage: ContentMessage = {
            Contact: chat.contact,
            Content: JSON.stringify(offer),
            Type: MessageType.Offer,
            TimeStampUtc: (new Date()).toISOString()
        };

        const answer = await this.signalConnection.sendRequest(CHAT_HUB.SEND_REQUEST_METHOD, offerMessage);

        console.log('Got WebRTC answer: ' + answer?.Content);

        if (answer?.Type === MessageType.Answer && answer?.Content) {
            const answerContent = JSON.parse(answer.Content) as RTCSessionDescriptionInit;

            if (answerContent?.sdp && answerContent.type === 'answer') {
                await connection.acceptRemoteSDP(answerContent);

                this.connections.push(connection);

                console.log('WebRTC successful exchange');
                //this.changeState('connecting');

                return true;
            }
        }

        //Not connected
        this.endCall();

        return false;
    }

    async acceptOffer(offerMessage: ContentMessage): Promise<Message> {
        console.log('Got WebRTC offer: ' + offerMessage.Content);

        const offer = JSON.parse(offerMessage.Content) as RTCSessionDescriptionInit;

        let isAccepting = false;
        let permissions: MediaKind;
        if (offerMessage.Type === MessageType.Offer
            && offer.type === 'offer'
            && this.getUserCallAccept) {
            permissions = await this.getUserCallAccept(offerMessage.Sender!);
            isAccepting = !!(permissions.audio || permissions.video);
        }
        else
            isAccepting = false;

        if (!isAccepting)
            return {
                Type: MessageType.CloseConnection,
                Contact: offerMessage.Sender!,
                TimeStampUtc: (new Date()).toISOString()
            };

        const chat = await this.loadChatToStore(offerMessage.Contact);

        this.currentChatCaller = chat;
        const connection = await this.createConnection(offerMessage.Contact);;

        await connection.acceptRemoteSDP(offer);

        const answer = await connection.createSDP('answer');

        const answerMessage: ContentMessage = {
            Contact: offerMessage.Contact,
            Content: JSON.stringify(answer),
            Type: MessageType.Answer,
            TimeStampUtc: (new Date()).toISOString()
        };

        this.connections.push(connection);
        //this.changeState('connecting');

        return answerMessage;
    }

    async changeState(state: RTCPeerConnectionState) {
        this.state = state;
        this.onStateChange?.call(this, this.state);

        if (state === 'connecting') {
            this.onConnecting?.call(this, await this.getLocalMedia(), this.connections);
        }
        else if (state === 'connected') {
            console.log('WebRTC successful connect')
            this.onConnected?.call(this, await this.getLocalMedia(), this.connections);
        }
        else if (state === 'closed' || state === 'disconnected') {
            this.onClosed?.call(this);
        }
    }

    addRemoteIceCandidates(message: Message) {
        console.log("Receive ICE candidates");

        this.connections.forEach(x => x.addRemoteIceCandidates(message));
    }

    async loadChatToStore(contact: ContactModel): Promise<Chat> {
        const chatsState = this.store.getState().chatState;
        let loadedChat = findChatByContact(chatsState, contact);

        if (!loadedChat) {
            loadedChat = contact.ChatId
                ? await this.chatService.LoadChat(contact.ChatId)
                : { contact: contact, participants: null, messages: null, isLoaded: false };

            this.store.dispatch(updateOrAddChat(loadedChat))
        }

        this.store.dispatch(selectCaller(loadedChat));

        return loadedChat;
    }

    endCall() {
        this.changeState("closed");
        
        while (this.connections.length > 0) {
            const connection = this.connections.pop()!;

            if (connection.isConnected()) {
                connection.sendPeerMessage({
                    Contact: this.currentChatCaller!.contact,
                    Type: MessageType.CloseConnection,
                    TimeStampUtc: (new Date()).toISOString()
                });
            } else {
                this.signalConnection.sendRequest(CHAT_HUB.SEND_MESSAGE_METHOD, {
                    Contact: this.currentChatCaller!.contact,
                    Type: MessageType.CloseConnection,
                    TimeStampUtc: (new Date()).toISOString()
                });
            }

            this.closeConnection(connection);
        }

        this.stopLocalMedia();
        this.currentChatCaller = undefined;
    }

    async createConnection(contact: ContactModel) {
        const localMedia = await this.getLocalMedia();
        const connection = new InterClientConnection(localMedia, contact, undefined);
        this.changeState(connection.peerConnection.connectionState);

        connection.peerConnection.onconnectionstatechange = (event) => {
            this.changeState(connection.peerConnection.connectionState);
            console.log(connection.peerConnection.connectionState);
        }

        connection.onCollectedIceCandidates = (candidates) => this.sendCollectedIceCandidates(connection, candidates);
        connection.onMessage.push(this.dispatchInterClientMessage.bind(this));
        connection.onClosed = () => { /*this.closeConnection(connection);*/ this.endCall(); };
        //connection.onConnected = () => this.changeState("connected");

        return connection;
    }

    closeConnection(connection: InterClientConnection): void {
        connection.onCollectedIceCandidates = undefined;
        connection.onMessage.remove(this.dispatchInterClientMessage);
        connection.onClosed = undefined;
        connection.onConnected = undefined;
        connection.close();

        this.connections.remove(connection);
    }

    sendCollectedIceCandidates(connection: InterClientConnection, candidate: RTCIceCandidate[]) {
        const informMessage: ContentMessage = {
            Contact: connection.contact,
            Content: JSON.stringify(candidate),
            Type: MessageType.IceCandidate,
            TimeStampUtc: (new Date()).toISOString()
        };

        console.log("Sending ICE candidates");

        this.signalConnection.sendRequest(CHAT_HUB.SEND_MESSAGE_METHOD, informMessage);
    }

    localMedia?: Media;

    async getLocalMedia() {
        if (!this.localMedia)
            this.localMedia = await Media.createLocal();

        return this.localMedia;
    }

    stopLocalMedia(){
        this.localMedia?.stop();
        this.localMedia = undefined;
    }

    sendPeerMessage(message: Message) {
        this.connections.forEach(x => {
            if (ContactModel.isEqual(x.contact, message.Contact))
                x.sendPeerMessage(message);
        })
    }
}