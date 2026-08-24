
import type { MediaRead } from "./media";
import type { EntityType } from "./sync_change";

export type NoteRead = {
    id: string;
    mediaId: string;
    media: MediaRead;
    title: string;
    content: string;
    timestamp: number | null;
    createdAt: number;
    updatedAt: number;
};

export type Note = NoteRead & {
    deletedAt: number | null;
    version: number;
    entityType: EntityType.Note
}