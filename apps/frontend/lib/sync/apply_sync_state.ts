import type { SyncState } from "../types/SyncState";
import { getDatabase } from "../db/database";
import { LibraryRepository } from "../db/repositories/library_repository";
import { MediaRepository } from "../db/repositories/media_repository";
import { NoteRepository } from "../db/repositories/note_repository";
import { MediaProgressRepository } from "../db/repositories/media_progress_repository";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { EntityUnionType } from "../types/EntityUnion";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function applySyncState(state: SyncState, userId: string): Promise<void> {
  const db = await getDatabase();
  const libraryRepository = new LibraryRepository(db);
  const mediaRepository = new MediaRepository(db);
  const noteRepository = new NoteRepository(db);
  const mediaProgressRepository = new MediaProgressRepository(db);

  for (const library of state.libraries) {

    if(library.deletedAt)
      {
        await libraryRepository.deleteLibraryById(userId,library.id);
        continue;
      }
    await libraryRepository.upsertFromSync(library);

  }

  for (const media of state.media) {
    if(media.deletedAt)
      {
        // delete by media
        continue;
      }
    await mediaRepository.upsertFromSync(media);

  }

  for (const note of state.notes) {
    if(note.deletedAt)
      {
        // note delte 
        continue;
      }
    await noteRepository.upsertFromSync(note);
  }

  for (const progress of state.mediaProgress) {
    await mediaProgressRepository.upsertFromSync(progress);
  }

  await applyFileSync(state, userId);
}

export async function applyFileSync(state: SyncState, userId: string) {
  for (const library of state.libraries) {
    if (library.deletedAt) continue;
    if (!library.iconUrl) continue;


    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/media_storage/${userId}/${library.iconUrl}`,
    );
    if (!response.ok) {
      console.log("response body: ", await response.text());
      console.log("FILE NOT ON SERVER: ", library.iconUrl);
      continue;
    }

    const blob = await response.blob();

    if (Capacitor.getPlatform() === "web") {

      await Filesystem.writeFile({
        path: library.iconUrl,
        data: blob,
        directory: Directory.Data,
      });
    }
    else
    {
      const base64 = await blobToBase64(blob);
      await Filesystem.writeFile({
        path: library.iconUrl,
        data: base64,
        directory: Directory.Data,
        recursive: true
      });
    }
  }

  // other file sync
}
