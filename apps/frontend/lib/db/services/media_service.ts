import { v4 } from "uuid";
import { getDatabase } from "../database";
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


// TODO - make duraiotn helepr or smth im donbe

export async function createMedia(file: File, libraryId: string, deviceId: string)
{
    const db = await getDatabase();
    const repository = new MediaRepository(db);

    const id = v4();
    const filepath = `${libraryId}/${id}`;
    console.log("FIEL TYPE:", file.type);

    const media: Media = {
        id: id,
        libraryId: libraryId,
        filename: file.name,
        fileSize: file.size,
        filepath: `${libraryId}/${id}`,
        mediaType: file.type,
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
}