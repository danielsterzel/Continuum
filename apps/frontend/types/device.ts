

// no version because we do not need it this is for display 
export type DeviceRead = {
    id: string;
    userId: string;
    name: string | null;
    lastSeen: number;
}


export type DeviceWrite = {
    name: string | null;
}

export type Device = {
    id: string;
    userId: string;
    name: string | null;
    lastSeen: string;
    version: number
}