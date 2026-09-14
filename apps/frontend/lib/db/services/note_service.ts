import { Note } from "@/lib/types/Note";
import { getDatabase } from "../database";
import { NoteRepository } from "../repositories/note_repository";
import { queueEntityChange } from "@/lib/sync/sync";
import { SyncOperation } from "@/lib/types/SyncOperation";



export async function saveNoteToDbAndPushToQueue(note: Note, deviceId: string): Promise<boolean>
{
    const db = await getDatabase();
    const repository = new NoteRepository(db);

    try
    {
        await repository.add(note)
        await queueEntityChange(note, SyncOperation.CREATE, deviceId);
        return true;
    }
    catch(err)
    {   
        return false;
    }
}
export async function getAllNotesForMedia(userId: string, mediaId: string)
{
    const db = await getDatabase();
    const repository = new NoteRepository(db);
    
    const notes = await repository.getAllByMediaId(userId, mediaId);

    return notes;
}

