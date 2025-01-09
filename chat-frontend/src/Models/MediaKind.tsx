
export class MediaKind {
    audio?: boolean;
    video?: boolean;

    static all: MediaKind = { video: true, audio: true }
    static onlyAudio: MediaKind = { video: false, audio: true }
};
