
import type { MediaRead } from "./media";

export type NoteRead = {
    id: string;
    mediaId: string;
    media: MediaRead;
    title: string;
    content: string;
    timestamp: number | null;
    deleted_at: number | null;
    createdAt: number;
    updatedAt: number;
};

export type Note = NoteRead & {
    deletedAt: number;
    version: number;
}