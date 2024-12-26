import { ContactModel } from "@/Models/Contact";
import { SignalService } from "../SignalService/SignalService";
import { SDPMessage } from "@/Models/SDPMessage";
import { ChatMessage, MessageType } from "@/Models/Message";
import { CHAT_HUB } from "@/apiPaths";
import { off } from "process";
import { MediaKind } from "@/Models/MediaKind";
import { createEmptyStream } from "@/lib/utils";
import { Strait } from "next/font/google";

export class WebRTCService {
    static peerConnection: RTCPeerConnection;
    static currentChannel: RTCDataChannel | null = null;
    static currentCallChatId: number | null = null;

    static isUserAnswer: ((contact: ContactModel) => Promise<MediaKind>) | null = null;

    static isInitiated: boolean = false;
    static onInitiated: ((connection: RTCPeerConnection) => Promise<void>) | null = null;

    static onClose: (() => void) | null = null;

    static isConnected() {
        return this.peerConnection.signalingState === "stable"
            && this.peerConnection.remoteDescription
            && this.peerConnection.iceGatheringState === "complete"
    }

    static candidates: RTCIceCandidate[] = [];

    public static _initiazlize() {
        SignalService.onOfferReceive = (message) => this.receiveOffer(message);
    }

    static async prepareService() {
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

            if (e.candidate)
                this.candidates.push(e.candidate);

            if (!e.candidate && this.isConnected()) {
                this.informOtherParticipants(this.currentCallChatId!, this.candidates);
            }
        };

        this.peerConnection.onsignalingstatechange = (event) => {
            if (this.isConnected()) {
                this.informOtherParticipants(this.currentCallChatId!, this.candidates);
            }
        }

        SignalService.onRemoteIceCandidateOffer = (message) => {
            console.log('Received ice candidate: ' + message.Content);
            if (this.peerConnection) {
                const candidates = JSON.parse(message.Content) as RTCIceCandidate[];
                candidates.forEach(candidate => this.peerConnection.addIceCandidate(candidate));
            }
        };

        this.onInitiated && await this.onInitiated(this.peerConnection);
        this.isInitiated = true;
    }


    static async startConnection(contact: ContactModel) {
        //TODO Block if busy

        if (!this.isInitiated)
            await this.prepareService();

        if (this.currentChannel == null) {
            this.currentChannel = this.peerConnection.createDataChannel("channel1");
            this.setHandlersOnChannel(this.currentChannel);
        }

        this.currentCallChatId = contact.ChatId;

        const offer = await this.peerConnection.createOffer();

        await this.peerConnection.setLocalDescription(offer)

        const answer = await this.sendOffer(contact, JSON.stringify(offer));

        let answerContent: RTCSessionDescriptionInit | undefined;
        if (answer)
            answerContent = JSON.parse(answer.Content) as RTCSessionDescriptionInit;
        // if (this.peerConnection.currentRemoteDescription) {
        //     console.log("Already connected");
        //     this.currentChatId = null;
        //     return false;
        // }

        if (answerContent?.sdp && answerContent.type === 'answer') {
            await this.peerConnection.setRemoteDescription(answerContent);

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

    private static async sendOffer(contact: ContactModel, offerSDP: string) {
        const message: SDPMessage = { Content: offerSDP, Contact: contact };

        const answerOffer = await SignalService.sendRequest<SDPMessage>(CHAT_HUB.START_PEER_CONNECTION_METHOD, message);
        console.log("Got WebRTC answer: " + answerOffer?.Content);

        return answerOffer;
    }

    static async receiveOffer(offerSDP: SDPMessage): Promise<SDPMessage> {
        if (!this.isInitiated)
            await this.prepareService();

        //TODO Prevent if busy

        if (this.isUserAnswer && !(await this.isUserAnswer(offerSDP.Contact)))
            return {} as any;

        this.currentCallChatId = offerSDP.Contact.ChatId;

        console.log("Got WebRTC offer: " + offerSDP.Content);

        this.peerConnection.ondatachannel = e => {
            this.currentChannel = e.channel;
            this.setHandlersOnChannel(this.currentChannel);
        }

        const offer = JSON.parse(offerSDP.Content) as RTCSessionDescriptionInit;

        if (offer.type !== 'offer')
            return {} as any;

        await this.peerConnection.setRemoteDescription(offer);

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

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

    static endConnection() {
        this.peerConnection.getReceivers().forEach((receiver) => {
            const track = receiver.track;
            if (track) {
                track.stop();
            }
        });

        this.peerConnection.getTransceivers().forEach((transceiver) => {
            transceiver.stop();
        });

        this.peerConnection.close();

        this.peerConnection.onicecandidate = null;
        this.peerConnection.ontrack = null;
        this.peerConnection.onconnectionstatechange = null;
        this.peerConnection.oniceconnectionstatechange = null;
        this.peerConnection.onnegotiationneeded = null;
        this.peerConnection.onsignalingstatechange = null;

        if (this.currentChannel)
            this.currentChannel.close();

        this.isInitiated = false;
    }

    static async replaceTracks(newStream: MediaStream, constraints: MediaKind) {

        const connection = this.peerConnection;
        // Replace the audio track
        if (constraints.audio) {
            const newAudioTrack = newStream.getAudioTracks()[0];
            await replaceTrack(connection, newAudioTrack, 'audio');
        }

        if (constraints.video) {
            const newVideoTrack = newStream.getVideoTracks()[0];
            await replaceTrack(connection, newVideoTrack, 'video');
        }

        return newStream;
    }

    static setInputStream(stream: MediaStream) {
        this.peerConnection.ontrack = event => {
            // event.streams[0].getTracks().forEach(track => {
            //     stream.addTrack(track);
            // });
            stream.addTrack(event.track);
        }
    }

    static setOutputStream(stream: MediaStream) {
        stream.getTracks().forEach((track) => { this.peerConnection.addTrack(track, stream) })
    }
}

async function replaceTrack(peerConnection: RTCPeerConnection, track: MediaStreamTrack, kind: 'video' | 'audio') {
    if (track) {
        const sender = peerConnection.getSenders().find(sender => sender.track!.kind === kind);

        if (!sender) {
            console.warn(`No ${kind} sender found.`);
            return;
        }

        try {
            await sender.replaceTrack(track);
            console.log(`${kind} track replaced.`);
        } catch (error) {
            console.error("Error replacing tracks:", error);
            return null;
        }
    }
}

WebRTCService._initiazlize();