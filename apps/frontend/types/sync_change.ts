
enum EntityType{
    
    Note = "note",
    Library = "library",
    Media = "media",
    MediaProgress = "media_progress"
}

enum SyncOperation{
    CREATE="create",
    UPDATE="update",
    DELETE="delete"
}
export type SyncChange = {
    id?: string;
    deviceId: string;

    entityType: EntityType;
    entityId: string;
    operation: SyncOperation
    baseVersion: number;
    payload: Record<string, any>;
    createdAt: number;
}

export type SyncChangeWrite = {
    deviceId: string;
    entityType: string;
    entityId: string;
    operation: string
    baseVersion: number;
    payload: Record<string, any>;
}

export type SyncChangeRead = SyncChangeWrite & {
    id: string;
    createdAt: number;
}