import { v4 } from "uuid";
import { getDatabase, persistDatabase } from "../database";
import { MediaRepository } from "../repositories/media_repository";

import type { Media } from "@/lib/types/Media";
import { queueEntityChange } from "@/lib/sync/Sync";
import { SyncOperation } from "@/lib/types/SyncOperation";
import { EntityType } from "@/lib/types/EntityType";
import { saveLocalFile } from "@/lib/files/LocalFileStorage";

export async function getAllMediaForLibrary(userId: string, libraryId: string)
{
    const db = await getDatabase();
    const repository = new MediaRepository(db);

    return await repository.getAllByLibraryId(userId, libraryId);
}



// TODO: duration calculation helper

export async function createMedia(file: File, libraryId: string, deviceId: string)
{
    const db = await getDatabase();
    const repository = new MediaRepository(db);

    const id = v4();
    const filepath = `${libraryId}/${id}`;


    const mediaType = file.type.startsWith("image/") ? "image":
    file.type.startsWith("video/") ? "video" :
    file.type === "application/pdf" ? "pdf" : "unknown"

    const media: Media = {
        id: id,
        libraryId: libraryId,
        filename: file.name,
        fileSize: file.size,
        filepath: `${libraryId}/${id}`,
        mediaType: mediaType,
        rating: null,
        thumbnailUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        entityType: EntityType.Media,
        duration: null,
        deletedAt: null,
        version:0
    }
    
    await saveLocalFile(file, filepath);
    await repository.add(media);
    await queueEntityChange(media, SyncOperation.CREATE, deviceId);

    await persistDatabase();

    return media;
}

export async function deleteMediaFromLibrary(userId: string, libraryId: string, mediaId: string, deviceId: string)
{
    const db = await getDatabase();
    const repository = new MediaRepository(db);

    const media = await repository.getById(userId, libraryId, mediaId);
    console.log("userId IN DELETE SERVICE", userId)
    console.log("deviceId IN DELETE SERVICE", deviceId)
    console.log("libraryId IN DELETE SERVICE", libraryId)
    console.log("mediaId IN DELETE SERVICE", mediaId)

    if(!media)
        {
            console.error("NO MEDIA FOUND");
            throw new Error("Cannot delete non existing media");
        }


    await queueEntityChange(media, SyncOperation.DELETE, deviceId);
    await repository.deleteById(userId, libraryId, mediaId);
    await persistDatabase();
}