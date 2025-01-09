'use client';
import { modifyVolumeStream, getLocalMedia } from "@/lib/utils";
import { MediaKind } from "@/models/MediaKind";


export class Media {
  modifyVolume(value: number) {
    this.audioVolume = value;
    this.stream = modifyVolumeStream(this.sourceStream, this.audioVolume);
    this.onStreamChange?.call(this, this.stream, { audio: true });
  }

  private audioVolume: number = 1;
  public stream: MediaStream;

  onStreamChange?: ((stream: MediaStream, kind: MediaKind) => void);

  private constructor(private sourceStream: MediaStream, private mediaKind: MediaKind) {
    this.stream = sourceStream;
    this.setMediaKind(mediaKind);
  }

  static createEmpty(permission: MediaKind = MediaKind.all) {
    const stream = new MediaStream();
    const media = new Media(stream, permission);
    return media;
  }

  static async createLocal(permission: MediaKind = MediaKind.all) {
    const stream = await getLocalMedia();
    const media = new Media(stream, permission);
    return media;
  }

  stop() {
    this.stream.getTracks().forEach((track) => track.stop());
  }

  setMediaKind(permissions: MediaKind) {
    this.stream.getAudioTracks().forEach(x => x.enabled = permissions.audio ?? false);

    this.stream.getVideoTracks().forEach(x => x.enabled = permissions.video ?? false);

    // this.sourceStream.getAudioTracks().forEach(x =>
    //   x.enabled = permissions.audio ?? false);
    // this.sourceStream.getVideoTracks().forEach(x =>
    //   x.enabled = permissions.video ?? false);
    this.mediaKind = permissions;
  }

  hasTracks(mediaKind: MediaKind) {
    return (mediaKind.audio ? this.stream.getAudioTracks().length > 0 : true)
      && (mediaKind.video ? this.stream.getVideoTracks().length > 0 : true);
  }
}
