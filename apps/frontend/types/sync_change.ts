
export enum EntityType{
    
    Note = "note",
    Library = "library",
    Media = "media",
    MediaProgress = "media_progress",
    Device = "device"
}

export enum SyncOperation{
    CREATE="create",
    UPDATE="update",
    DELETE="delete"
}
export type SyncChange = {
    id: string;
    deviceId: string;

    entityType: EntityType;
    entityId: string;
    operation: SyncOperation
    expectedVersion: number;
    payload: Record<string, any>;
    createdAt: string;
}

export type SyncChangeWrite = {
    deviceId: string;
    entityType: string;
    entityId: string;
    operation: string
    expectedVersion: number;
    payload: Record<string, any>;
}

export type SyncChangeRead = SyncChangeWrite & {
    id: string;
    createdAt: number;
}