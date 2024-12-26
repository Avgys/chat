import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const createEmptyStream = (() => {
  let stream: MediaStream | null = null;

  return () => {
    if (!stream) {
      const audioTrack = createEmptyAudioTrack();
      const videoTrack = createEmptyVideoTrack();
      stream = new MediaStream([audioTrack, videoTrack]);
    }
    return stream;
  }
})();

export function createEmptyAudioTrack() {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator(); // Generate a silent signal
  const destination = audioContext.createMediaStreamDestination();
  oscillator.connect(destination);
  oscillator.start();
  return destination.stream.getAudioTracks()[0];
}

export function createEmptyVideoTrack() {
  // Create an empty video track
  const canvas = document.createElement("canvas");
  canvas.width = 640; // Set desired resolution
  canvas.height = 480;
  const stream = canvas.captureStream(30); // 30 FPS
  return stream.getVideoTracks()[0];
}

export async function getLocalMedia() {
  const combinedStream = new MediaStream();
  try {
    //const videoStream = await navigator.mediaDevices.getDisplayMedia();
    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Add audio tracks
    audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
    // Add video tracks
    videoStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));

  } catch (err) {
    console.error(err);
  }

  return combinedStream;
}

export const modifyVolumeStream = (() => {
  let audioContext: AudioContext | null = null;

  return (inputStream: MediaStream, volume: number): MediaStream => {
    const audioTrack = inputStream.getAudioTracks()[0];

    if (!audioTrack) {
      console.warn("No audio track found in the stream");
      return inputStream;
    }

    if (!audioContext)
      audioContext = new AudioContext();

    const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume / 100; // 1 = 100%

    source.connect(gainNode);
    const modifiedAudioStream = audioContext.createMediaStreamDestination();
    gainNode.connect(modifiedAudioStream);

    const newStream = new MediaStream([
      ...inputStream.getVideoTracks(),
      ...modifiedAudioStream.stream.getAudioTracks(),
    ]);

    return newStream;
  };
})();