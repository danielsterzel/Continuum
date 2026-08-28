import { EntityType } from "./sync_change";


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
    deletedAt: string | null;
    version: number;
    entityType: EntityType.Device
}
