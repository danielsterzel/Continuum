import { Note } from "@/lib/types/Note";
import { getDatabase } from "../database";
import { NoteRepository } from "../repositories/note_repository";
import { queueEntityChange } from "@/lib/sync/sync";
import { SyncOperation } from "@/lib/types/SyncOperation";


export async function saveNoteToDbAndPushToQueue(
  note: Note,
  deviceId: string,
): Promise<boolean> {
  const db = await getDatabase();
  const repository = new NoteRepository(db);

  try {
    await repository.add(note);
    await queueEntityChange(note, SyncOperation.CREATE, deviceId);
    return true;
  } catch (err) {
    return false;
  }
}
export async function getAllNotesForMedia(userId: string, mediaId: string) {
  const db = await getDatabase();
  const repository = new NoteRepository(db);

  const notes = await repository.getAllByMediaId(userId, mediaId);

  return notes;
}

export async function updateNoteService(
  userId: string,
  noteId: string,
  deviceId: string,
  title?: string,
  timestamp?: number,
  content?: string
): Promise<Note | null> {

  if(title === "")
  {
    return null;
  }

  const db = await getDatabase();
  const repository = new NoteRepository(db);

  const note = await repository.getByNoteId(userId, noteId);
  if (!note) return null;

  const updatedNote = {...note, timestamp: timestamp ?? note.timestamp, 
    title: title ?? note.title, content: content ?? note.content,
    updatedAt: new Date().toISOString(),
  };

  try {
    await repository.update(userId, updatedNote);
    await queueEntityChange(updatedNote, SyncOperation.UPDATE, deviceId);
    return updatedNote;
  } catch {
    return null;
  }
}

export async function deleteNoteService(userId: string, noteId: string, deviceId: string)
{
    const db = await getDatabase();
    const repository = new NoteRepository(db);

    const existingNote = await repository.getByNoteId(userId, noteId);
    if(!existingNote) return {deletedNote: null, success: false};

    try
    {
        await queueEntityChange(existingNote, SyncOperation.DELETE, deviceId);
        await repository.deleteById(userId, noteId)
        return {deletedNote: existingNote, success:true}
    }
    catch
    {
        return {deletedNote: null, success: false};
    }
}
