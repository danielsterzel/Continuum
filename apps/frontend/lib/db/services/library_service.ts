import type { Library } from "@/lib/types/Library";
import { getDatabase } from "../database";
import { LibraryRepository } from "../repositories/library_repository";
import { queueEntityChange } from "@/lib/sync/Sync";
import { SyncOperation } from "@/lib/types/SyncOperation";


export async function getLibrary(userId: string, libraryId: string)
{
    const db = await getDatabase();
    const repository = new LibraryRepository(db);

    return repository.getByLibId(userId, libraryId);
}

export async function getLibraries(userId: string)
{
    const db = await getDatabase();
    const repository = new LibraryRepository(db);

    return repository.getAllForUser(userId);
}
export async function saveLibraryToDb(library: Library)
{
    const db = await getDatabase();
    const repository = new LibraryRepository(db);

    return repository.add(library);
}
export async function deleteLibrary(library: Library, deviceId: string)
{
    const db = await getDatabase();
    const repository = new LibraryRepository(db);

    await queueEntityChange(library, SyncOperation.DELETE, deviceId);
    await repository.deleteLibraryById(library.userId, library.id);

}