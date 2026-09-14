import { v4 } from "uuid";
import { getDatabase, persistDatabase } from "../database";
import { MediaRepository } from "../repositories/media_repository";

import type { Media } from "@/lib/types/Media";
import { queueEntityChange } from "@/lib/sync/sync";
import { SyncOperation } from "@/lib/types/SyncOperation";
import { EntityType } from "@/lib/types/EntityType";
import { deleteFileFromLocalStorage, saveLocalFile } from "@/lib/files/LocalFileStorage";
import { getVideoDuration } from "@/lib/files/Video";

export async function getAllMediaForLibrary(userId: string, libraryId: string)
{
    const db = await getDatabase();
    const repository = new MediaRepository(db);

    return await repository.getAllByLibraryId(userId, libraryId);
}

export async function getMediaById(userId: string, libraryId: string, mediaId: string)
{
    const db = await getDatabase();
    const repository = new MediaRepository(db);
    
    return await repository.getById(userId, libraryId, mediaId);
}

export async function createMedia(file: File, libraryId: string, deviceId: string) {
    const db = await getDatabase();
    const repository = new MediaRepository(db);

    const id = v4();
    const extension = getFileExtension(file);
    const filepath = extension ? `${libraryId}/${id}.${extension}` : `${libraryId}/${id}`;
    console.log("MEDIA SERVICE FILEPATH: ", filepath);


    const mediaType = file.type.startsWith("image/") ? "image":
    file.type.startsWith("video/") ? "video" :
    file.type === "application/pdf" ? "pdf" : "unknown"

    const duration = mediaType === "video" ? await getVideoDuration(file) : null;

    const media: Media = {
        id: id,
        libraryId: libraryId,
        filename: file.name,
        fileSize: file.size,
        filepath: filepath,
        mediaType: mediaType,
        rating: null,
        thumbnailUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        entityType: EntityType.Media,
        duration: duration,
        deletedAt: null,
        version: 0
    }
    await saveLocalFile(file, filepath);
    await repository.add(media);
    await queueEntityChange(media, SyncOperation.CREATE, deviceId);

    await persistDatabase();

    return media;
}

function getFileExtension(file: File): string | null {
    const extensionFromName = file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1];
    if (extensionFromName) {
        return extensionFromName.toLowerCase();
    }

    const extensionsByMimeType: Record<string, string> = {
        "video/quicktime": "mov",
        "video/mp4": "mp4",
        "video/x-m4v": "m4v",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "audio/mpeg": "mp3",
        "audio/mp4": "m4a",
        "application/pdf": "pdf",
    };

    return extensionsByMimeType[file.type.toLowerCase()] ?? null;
}

export async function deleteMediaFromLibrary(userId: string, libraryId: string, mediaId: string, deviceId: string) {
    const db = await getDatabase();
    const repository = new MediaRepository(db);

    const media = await repository.getById(userId, libraryId, mediaId);

    if (!media) {
        throw new Error(`Deleting non existing media is prohibited. Media with id: ${mediaId} does not exist`);
    }

    await queueEntityChange(media, SyncOperation.DELETE, deviceId);
    await repository.deleteById(userId, libraryId, mediaId);

    try {
        await deleteFileFromLocalStorage(media.filepath);
    } catch (error) {
        console.warn(`Media record deleted, but local file could not be deleted: ${media.filepath}`, error);
    }

    await persistDatabase();
}
