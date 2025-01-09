export function UnixSecondsNow() {
    return Math.floor(Date.now() / 1000);
}