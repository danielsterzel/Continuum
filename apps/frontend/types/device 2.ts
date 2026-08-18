

export type Device = {
    id: string;
    userId: string;
    name: string | null;
    lastSeen: number;
}

export type DeviceWrite = {
    name: string | null;
}