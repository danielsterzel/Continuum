
import type { SyncState } from "@/types/sync_state";
import { getDatabase } from "../db/database";
import { LibraryRepository } from "../db/repositories/library_repository";
import { MediaRepository } from "../db/repositories/media_repository";
import { NoteRepository } from "../db/repositories/note_repository";
import { MediaProgressRepository } from "../db/repositories/media_progress_repository";

export async function applySyncState(
  state: SyncState,
): Promise<void> {
    
    const db = await getDatabase();
    const libraryRepository = new LibraryRepository(db);
    const mediaRepository = new MediaRepository(db);
    const noteRepository = new NoteRepository(db);
    const mediaProgressRepository = new MediaProgressRepository(db);

    for (const library of state.libraries) {
    await libraryRepository.upsertFromSync(library);
    }

    for (const media of state.media) {
    await mediaRepository.upsertFromSync(media);
    }

    for (const note of state.notes) {
    await noteRepository.upsertFromSync(note);
    }

    for (const progress of state.mediaProgress) {
    await mediaProgressRepository.upsertFromSync(progress);
    }

}