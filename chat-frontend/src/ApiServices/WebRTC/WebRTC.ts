import { ContactModel } from '@/Models/Contact';
import { SignalService } from '../SignalService/SignalService';
import { ContentMessage, InterClientMessageType, Message, MessageType } from '@/Models/Message';
import { CHAT_HUB } from '@/apiPaths';
import { MediaKind } from '@/Models/MediaKind';

export class WebRTCService {
    static peerConnection: RTCPeerConnection;
    static currentChannel: RTCDataChannel | undefined = undefined;
    static currentCallContact: ContactModel | null = null;

    static getUserCallAccept: ((contact: ContactModel) => Promise<boolean>) | null = null;

    static isInitiated: boolean = false;
    static onInitiated: ((connection: RTCPeerConnection) => Promise<void>) | null = null;

    static onClosed: (() => void) | null = null;
    static onPeerMessageReceive: ((message: Message | ContentMessage) => void)[] = [];

    static isConnected() {
        return this.peerConnection.signalingState === 'stable'
            && this.peerConnection.remoteDescription
            && this.peerConnection.iceGatheringState === 'complete'
    }


    public static ConnectedCliens: any[];

    public static _initiazlize() {
        SignalService.onOfferReceive = (message) => this.receiveOffer(message);
    }

    static async prepareService() {
        // const servers = {
        //     iceServers: [
        //         {
        //             // urls: ['stun:stun.l.google.com:19302', 'stun:stun.l.google.com:5349']
        //             urls: ['localhost']
        //         }
        //     ],
        //     iceCandidatePoolSize: 10
        // };

        this.peerConnection = new RTCPeerConnection(undefined);

        this.SetHandlersOnConnection(this.peerConnection);

        SignalService.onRemoteIceCandidateOffer = (message) => {
            console.log('Received ice candidate: ' + message.Content);
            if (this.peerConnection && message.Content) {
                const candidates = JSON.parse(message.Content) as RTCIceCandidate[];
                candidates.forEach(candidate => this.peerConnection.addIceCandidate(candidate));
            }
        };

        this.onInitiated && await this.onInitiated(this.peerConnection);
        this.isInitiated = true;
    }

    static SetHandlersOnConnection(peerConnection: RTCPeerConnection) {
        const candidates: RTCIceCandidate[] = [];

        peerConnection.onicecandidate = e => {
            console.log('New Ice Candidate ' + JSON.stringify(e.candidate));

            if (e.candidate)
                candidates.push(e.candidate);

            if (!e.candidate && this.isConnected()) {
                this.informOtherParticipants(this.currentCallContact!, candidates);
            }
        };

        peerConnection.onsignalingstatechange = (event) => {
            if (this.isConnected()) {
                this.informOtherParticipants(this.currentCallContact!, candidates);
            }

            console.log(peerConnection.signalingState)
        }
    }

    static async startConnection(contact: ContactModel) {
        //TODO Block if busy

        if (!this.isInitiated)
            await this.prepareService();

        if (this.currentChannel != null)
            this.currentChannel.close();

        this.currentChannel = this.peerConnection.createDataChannel('channel1');
        this.setHandlersOnChannel(this.currentChannel);

        this.currentCallContact = contact;

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        const offerMessage: ContentMessage = {
            Contact: contact,
            Content: JSON.stringify(offer),
            Type: MessageType.Offer,
            TimeStampUtc: (new Date()).toISOString()
        };

        const answer = await SignalService.sendRequest(CHAT_HUB.SEND_REQUEST_METHOD, offerMessage);

        if (answer?.Content) {
            const answerContent = JSON.parse(answer.Content) as RTCSessionDescriptionInit;

            if (answerContent?.sdp && answerContent.type === 'answer') {
                await this.peerConnection.setRemoteDescription(answerContent);
                console.log('set successfully')
                return this.peerConnection;
            }
        }

        //Not connected
        this.endConnection();
        this.currentCallContact = null;

        return null;
    }

    static async receiveOffer(offerMessage: ContentMessage): Promise<ContentMessage> {
        let isAccepting = false;

        if (this.getUserCallAccept)
            isAccepting = await this.getUserCallAccept(offerMessage.Contact)

        if (!isAccepting)
            return {} as any;

        if (this.isInitiated)
            this.endConnection();

        await this.prepareService();

        this.currentCallContact = offerMessage.Contact;

        console.log('Got WebRTC offer: ' + offerMessage.Content);

        this.peerConnection.ondatachannel = e => {
            this.currentChannel = e.channel;
            this.setHandlersOnChannel(this.currentChannel);
        }

        const offer = JSON.parse(offerMessage.Content) as RTCSessionDescriptionInit;

        if (offer.type !== 'offer')
            return {} as any;

        await this.peerConnection.setRemoteDescription(offer);

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        const answerMessage: ContentMessage = {
            Contact: offerMessage.Contact,
            Content: JSON.stringify(answer),
            Type: MessageType.Answer,
            TimeStampUtc: (new Date()).toISOString()
        };

        return answerMessage;
    }

    static setHandlersOnChannel(dc: RTCDataChannel) {
        dc.onmessage = (e) => {
            this.dispatchMessage(e);
            console.log('GotMessage ' + e.data)
        };

        dc.onopen = e => {
            console.log('Channel opened: ' + e.type);
            this.sendPeerMessage({
                Contact: {},
                Type: InterClientMessageType.Connected,
                TimeStampUtc: (new Date()).toISOString()
            });
        };

        dc.onclose = e => {
            console.log('Channel closed: ' + e.type);
            this.endConnection();

            if (this.onClosed)
                this.onClosed();
        };
    }

    static dispatchMessage(e: MessageEvent<any>) {
        const data: Message = JSON.parse(e.data);
        console.log("Receiver peer message " + data);

        this.onPeerMessageReceive.forEach(func => {
            try {
                func(data);
            }
            catch (e) {
                console.log(func.name + ' raised exception: ' + e);
            }
        });
    }

    static sendPeerMessage(message: Message) {
        if (this.currentChannel?.readyState == 'open')
            this.currentChannel?.send(JSON.stringify(message));
    }

    static informOtherParticipants(contact: ContactModel, candidate: any) {
        const informMessage: ContentMessage = {
            Contact: contact,
            Content: JSON.stringify(candidate),
            Type: MessageType.IceCandidate,
            TimeStampUtc: (new Date()).toISOString()
        };

        SignalService.sendRequest(CHAT_HUB.SEND_MESSAGE_METHOD, informMessage);
    }

    static endConnection() {
        if (!this.isInitiated)
            return;

        if (this.peerConnection.connectionState == 'connecting' && this.currentCallContact) {
            SignalService.sendRequest(CHAT_HUB.SEND_MESSAGE_METHOD, {
                Contact: this.currentCallContact,
                Type: MessageType.CloseConnection,
                TimeStampUtc: (new Date()).toISOString()
            });
        }

        this.peerConnection
            .getReceivers()
            .forEach((receiver) => {
                receiver.track
                    && receiver.track.stop();
            });

        this.peerConnection
            .getSenders()
            .forEach((sender) => {
                if (sender.track)
                    sender.track.stop();
            });

        this.currentChannel!.close();
        this.removeHandlersFromChannel(this.currentChannel!);
        this.currentChannel = undefined;

        this.peerConnection.close();
        this.removeHandlersFromConnection(this.peerConnection);
        this.isInitiated = false;
    }

    static removeHandlersFromChannel(channel: RTCDataChannel) {
        channel.onclose = null;
        channel.onmessage = null;
        channel.onopen = null;
    }

    static removeHandlersFromConnection(peerConnection: RTCPeerConnection) {
        peerConnection.onicecandidate = null;
        peerConnection.ontrack = null;
        peerConnection.onconnectionstatechange = null;
        peerConnection.oniceconnectionstatechange = null;
        peerConnection.onnegotiationneeded = null;
        peerConnection.onsignalingstatechange = null;
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

            const track = event.track;
            stream.addTrack(track);
            stream.onaddtrack?.call(stream, { track } as any)
            track.onmute = () => console.log(`${track.kind} track is muted.`);
            track.onunmute = () => console.log(`${track.kind} track is unmuted.`);
            track.onended = () => console.log(`${track.kind} track has ended.`);
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

        sender.track!.onmute = null;
        sender.track!.onunmute = null;
        sender.track!.onended = null;

        track.onmute = () => console.log(`${track.kind} track is muted.`);
        track.onunmute = () => console.log(`${track.kind} track is unmuted.`);
        track.onended = () => console.log(`${track.kind} track has ended.`);

        try {
            await sender.replaceTrack(track);
            console.log(`${kind} track replaced.`);
        } catch (error) {
            console.error('Error replacing tracks:', error);
            return null;
        }
    }
}

WebRTCService._initiazlize();