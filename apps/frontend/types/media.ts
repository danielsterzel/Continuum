
import type { EntityType } from "./sync_change";

export type MediaRead = {
    id: string;
    libraryId: string;
    filename: string;
    fileSize: number;
    mediaType: string;
    duration: number | null;
    thumbnailUrl: string | null; 
    rating: number | null;
    createdAt: string;
    updatedAt: string;
}

export type Media = MediaRead & {
    deletedAt: number;
    version: number;
    entityType: EntityType.Media;
    // filepath: string; tego nie bo sobie sam backend zrobi fielpath
}
export type MediaType = "video" | "audio" | "image" | "document";

