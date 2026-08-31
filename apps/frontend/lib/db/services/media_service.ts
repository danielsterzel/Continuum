import { getDatabase } from "../database";
import { MediaRepository } from "../repositories/media_repository";


export async function getAllMediaForLibrary(userId: string, libraryId: string)
{
    const db = await getDatabase();
    const repository = new MediaRepository(db);

    return await repository.getAllByLibraryId(userId, libraryId);
}