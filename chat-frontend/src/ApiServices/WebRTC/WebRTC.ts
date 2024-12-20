import { Contact } from "@/Models/Contact";
import { SignalService } from "../SignalService/SignalService";
import { SDPMessage } from "@/Models/SDPMessage";
import { ChatMessage, MessageType } from "@/Models/Message";
import { CHAT_HUB } from "@/apiPaths";
import { off } from "process";
import { MediaKind } from "@/components/chat-components/selected-contact";

export class WebRTCService {
    static peerConnection: RTCPeerConnection;
    static isInitiated: boolean = false;
    static currentChannel: RTCDataChannel | null = null;
    static currentCallChatId: number | null = null;

    static isUserAnswer: ((contact: Contact) => Promise<MediaKind>) | null = null;

    static prepareService() {
        // const servers = {
        //     iceServers: [
        //         {
        //             // urls: ["stun:stun.l.google.com:19302", "stun:stun.l.google.com:5349"]
        //             urls: ["localhost"]
        //         }
        //     ],
        //     iceCandidatePoolSize: 10
        // };

        this.peerConnection = new RTCPeerConnection(undefined);

        this.peerConnection.onicecandidate = e => {
            console.log("New Ice Candidate " + JSON.stringify(e.candidate));

            if (e.candidate && this.currentCallChatId) {
                this.informOtherParticipants(this.currentCallChatId, e.candidate);
            }
        };

        SignalService.onIceCandidateOffer = (message) => {
            console.log('Received ice candidate: ' + message.Content);
            if (this.peerConnection) {
                this.peerConnection.addIceCandidate(JSON.parse(message.Content));
            }
        };

        SignalService.onOfferReceive = this.receiveOffer;

        this.isInitiated = true;
    }

    static async startConnection(contact: Contact) {
        //TODO Block if busy

        if (!this.isInitiated)
            this.prepareService();

        if (this.currentChannel == null) {
            this.currentChannel = this.peerConnection.createDataChannel("channel1");
            this.setHandlersOnChannel(this.currentChannel);
        }

        this.currentCallChatId = contact.ChatId;

        const offer = await this.peerConnection.createOffer();

        await this.peerConnection.setLocalDescription(offer)

        const answer = await this.sendOffer(contact, JSON.stringify(offer));

        // if (this.peerConnection.currentRemoteDescription) {
        //     console.log("Already connected");
        //     this.currentChatId = null;
        //     return false;
        // }

        if (answer) {
            await this.peerConnection.setRemoteDescription(JSON.parse(answer.Content));

            console.log("set successfully")
            //this.currentChannel.send('Hi');
            return this.peerConnection;
        }
        else {
            console.log("No answer");
            this.currentCallChatId = null;
            return null;
        }
    }

    static setHandlersOnChannel(dc: RTCDataChannel) {
        dc.onmessage = (e) => {
            console.log("GotMessage " + e.data)
        };

        dc.onopen = e => {
            console.log("Channel opened: " + e.type);
            this.sendMessage('Test message');
        };
    }

    private static async sendOffer(contact: Contact, offerSDP: string) {
        const message: SDPMessage = { Content: offerSDP, Contact: contact };

        const answerOffer = await SignalService.sendRequest<SDPMessage>(CHAT_HUB.START_PEER_CONNECTION_METHOD, message);
        console.log("Got WebRTC answer: " + answerOffer?.Content);

        return answerOffer;
    }

    static async receiveOffer(offerSDP: SDPMessage): Promise<SDPMessage> {
        if (!WebRTCService.isInitiated)
            WebRTCService.prepareService();

        //TODO Prevent if busy

        if (this.isUserAnswer && !await this.isUserAnswer(offerSDP.Contact))
            return {} as any;

        console.log("Got WebRTC offer: " + offerSDP.Content);

        WebRTCService.peerConnection.ondatachannel = e => {
            WebRTCService.currentChannel = e.channel;
            WebRTCService.setHandlersOnChannel(WebRTCService.currentChannel);
        }

        const offer = JSON.parse(offerSDP.Content);
        await WebRTCService.peerConnection.setRemoteDescription(offer);

        const answer = await WebRTCService.peerConnection.createAnswer();
        await WebRTCService.peerConnection.setLocalDescription(answer);

        WebRTCService.currentCallChatId = offerSDP.Contact.ChatId;

        return { Content: JSON.stringify(answer), Contact: offerSDP.Contact };
    }

    static sendMessage(message: string) {
        this.currentChannel?.send(message);
    }

    static informOtherParticipants(chatId: number, candidate: any) {
        const informMessage: ChatMessage = {
            ChatId: chatId,
            Content: JSON.stringify(candidate),
            Type: MessageType.IceCandidate,
            TimeStampUtc: (new Date()).toISOString()
        };

        SignalService.sendRequest(CHAT_HUB.SEND_CHAT_MESSAGE_METHOD, informMessage);
    }
}
