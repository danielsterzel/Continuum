
import { EntityType } from "./sync_change";

export type MediaProgressRead = {
    id: string;
    mediaId: string;
    currentPosition: number | null;
    lastWatched: number;
    lastDeviceId: string;
}

export type MediaProgressWrite = {
    currentPosition: number | null;
    lastDeviceId: number | null;
}

export type MediaProgress = MediaProgressRead &  {
    deletedAt: number;
    version: number;
    entityType: EntityType.MediaProgress

}