
import { ContentMessage, Message, MessageType } from '@/models/Message';
import { MediaKind } from '@/models/MediaKind';
import { ContactModel } from '@/models/Contact';
import { Media } from "@/lib/media";

export class InterClientConnection {
    media: Media;

    peerConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel | undefined = undefined;

    isClosed: boolean = false;

    onConnected?: (() => void);
    onClosed?: (() => void);
    onCollectedIceCandidates?: (candidates: RTCIceCandidate[]) => void;

    onMessage: ((message: Message | ContentMessage) => void)[] = [];

    isConnected() {
        return this.peerConnection
            && this.peerConnection.signalingState === 'stable'
            && this.peerConnection.remoteDescription
            && this.peerConnection.iceGatheringState === 'complete'
    }

    isConnection() {
        return (this.peerConnection.connectionState == 'connecting'
            || this.peerConnection.iceConnectionState !== 'connected');
    }

    public constructor(localMedia: Media, public contact: ContactModel, stunServers?: RTCConfiguration) {
        this.peerConnection = new RTCPeerConnection(stunServers);
        this.media = Media.createEmpty();

        this.setInputStream(this.media.stream);
        this.setOutputStream(localMedia.stream);

        this.SetHandlersOnConnection(this.peerConnection);
    }

    SetHandlersOnConnection(peerConnection: RTCPeerConnection) {
        const candidates: RTCIceCandidate[] = [];

        peerConnection.onicecandidate = e => {
            console.log('New Ice Candidate ' + JSON.stringify(e.candidate));

            if (e.candidate)
                candidates.push(e.candidate);

            if (!e.candidate && this.isConnected()) {
                this.onCollectedIceCandidates?.call(this, candidates);
            }
        };

        peerConnection.onsignalingstatechange = (event) => {
            if (this.isConnected()) {
                this.onCollectedIceCandidates?.call(this, candidates);
            }

            console.log(peerConnection.signalingState)
        }
    }

    async createSDP(type: RTCSdpType) {
        //TODO Block if busy

        let sdpPacket = undefined;
        if (type === 'offer') {
            this.dataChannel = this.peerConnection.createDataChannel('channel1');
            this.setHandlersOnChannel(this.dataChannel);

            sdpPacket = await this.peerConnection.createOffer();

        }
        else if (type === 'answer') {
            this.peerConnection.ondatachannel = e => {
                this.dataChannel = e.channel;
                this.setHandlersOnChannel(this.dataChannel);
            }
            sdpPacket = await this.peerConnection.createAnswer();
        }

        if (sdpPacket)
            await this.peerConnection.setLocalDescription(sdpPacket);

        return sdpPacket;
    }

    async acceptRemoteSDP(sdp: RTCSessionDescriptionInit) {

        if (sdp?.sdp) {
            await this.peerConnection.setRemoteDescription(sdp);
        }
        else
            throw new Error("Wrong sdp type packet: " + sdp.sdp);
    }

    setHandlersOnChannel(dc: RTCDataChannel) {
        dc.onmessage = (e) => {
            console.log("Receiver peer message " + e.data);
            const message: Message = JSON.parse(e.data);
            this.onMessage.forEach(listener => listener.call(this, message));
            console.log('GotMessage ' + e.data)
        };

        dc.onopen = e => {
            console.log('Channel opened: ' + e.type);

            this.onConnected?.call(this);
            this.sendPeerMessage({
                Contact: this.contact,
                Type: MessageType.Connected,
                TimeStampUtc: (new Date()).toISOString(),
                Content: 'Hello chatters'
            });
        };

        dc.onclose = e => {
            console.log('Channel closed: ' + e.type);
            this.close();
        };
    }

    addRemoteIceCandidates(message: Message) {
        const contentMessage = message as ContentMessage;
        if (this.peerConnection && contentMessage.Content) {
            console.log('Received ice candidates');
            const candidates = JSON.parse(contentMessage.Content) as RTCIceCandidate[];
            candidates.forEach(candidate => this.peerConnection.addIceCandidate(candidate));
        }
    }

    sendPeerMessage(message: Message | ContentMessage) {
        if (this.dataChannel?.readyState == 'open')
            this.dataChannel?.send(JSON.stringify(message));
    }

    // onCollectedIceCandidates(candidate: any[]) {
    //     const informMessage: ContentMessage = {
    //         Contact: contact,
    //         Content: JSON.stringify(candidate),
    //         Type: MessageType.IceCandidate,
    //         TimeStampUtc: (new Date()).toISOString()
    //     };

    //     //this.signalConnection.sendRequest(CHAT_HUB.SEND_MESSAGE_METHOD, informMessage);
    // }

    close() {
        if (!this.isClosed)
            return;

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


        if (this.dataChannel) {
            this.closeChannel(this.dataChannel);
            this.dataChannel = undefined;
        }

        this.peerConnection.close();
        this.removeHandlersFromConnection(this.peerConnection);

        this.isClosed = true;

        if (this.onClosed)
            this.onClosed();
    }

    closeChannel(channel: RTCDataChannel) {
        channel.close();
        channel.onclose = null;
        channel.onmessage = null;
        channel.onopen = null;
    }

    removeHandlersFromConnection(peerConnection: RTCPeerConnection) {
        peerConnection.onicecandidate = null;
        peerConnection.ontrack = null;
        peerConnection.onconnectionstatechange = null;
        peerConnection.oniceconnectionstatechange = null;
        peerConnection.onnegotiationneeded = null;
        peerConnection.onsignalingstatechange = null;
    }

    async replaceTracks(newStream: MediaStream, constraints: MediaKind) {
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

    setInputStream(stream: MediaStream) {
        this.peerConnection.ontrack = event => {
            const track = event.track;
            stream.addTrack(track);
            stream.onaddtrack?.call(stream, { track } as any);
        }
    }

    setOutputStream(stream: MediaStream) {
        stream.getTracks()
            .forEach((track) => {
                this.peerConnection.addTrack(track, stream)
            })
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