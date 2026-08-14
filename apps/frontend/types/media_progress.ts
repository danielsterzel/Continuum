


export type MediaProgressRead = {
    id: string;
    media_id: string;
    currentPosition: number | null;
    lastWatched: number;
    lastDeviceId: string;
}

export type MediaProgressWrite = {
    currentPosition: number | null;
    lastDeviceId: number | null;
}
