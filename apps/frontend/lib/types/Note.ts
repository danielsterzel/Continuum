
import { Media } from "./Media";
import { EntityType } from "./EntityType";

export type NoteRead = {
    id: string;
    mediaId: string;
    media: Media;
    title: string;
    content: string;
    timestamp: number | null;
    createdAt: number;
    updatedAt: number;
};

export type Note = {
    id: string;
    mediaId: string;
    media: Media;
    title: string;
    content: string;
    timestamp: number | null;
    createdAt: string;
    updatedAt: string;

    deletedAt: string | null;
    version: number;
    entityType: EntityType.Note
}