import type { SyncState } from "../types/SyncState";
import { getDatabase } from "../db/database";
import { LibraryRepository } from "../db/repositories/library_repository";
import { MediaRepository } from "../db/repositories/media_repository";
import { NoteRepository } from "../db/repositories/note_repository";
import { MediaProgressRepository } from "../db/repositories/media_progress_repository";
import { Library } from "../types/Library";
import { deleteFileFromLocalStorage, fileExistsLocally, saveLocalFile } from "../files/LocalFileStorage";
import { getMediaById } from "../db/services/media_service";

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
        const localMedia = await mediaRepository.getById(userId, media.libraryId, media.id);
        if(!localMedia){
          continue;
        }
        try
        {
        await mediaRepository.deleteById(userId, media.libraryId, media.id);
        }catch(err)
        {
          console.error("Couldn't handle delete: ", err);
        }

        try 
        {
          await deleteFileFromLocalStorage(localMedia.filepath);
        } catch (error) {
          console.warn(`Synced media record was deleted, but its local file could not be deleted: ${localMedia.filepath}`, error);
        }

        continue;
    }
    await mediaRepository.upsertFromSync(media);
  }

  for (const note of state.notes) {
    if(note.deletedAt) continue;

    try
    {
      await noteRepository.upsertFromSync(note);
    }
    catch(err)
    {
      console.error("Couldn't upser NOTE: ", err);
    }
  }

  for (const progress of state.mediaProgress) {

    const relatedMedia = state.media.find(
      (media) => media.id === progress.mediaId
    );

    if (relatedMedia?.deletedAt) continue;
    try
    {
      await mediaProgressRepository.upsertFromSync(progress);
    }
    catch(err)
    {
      const mediaProgress = await mediaProgressRepository.getMediaProgressById(
        userId, relatedMedia!?.libraryId, relatedMedia!.id
      );

      console.log("Server body: ", JSON.stringify(progress));
      console.log("Local body: ", JSON.stringify(mediaProgress));
      console.error("MediaProgress upsert fail: ", err);
    }
  }
  await applyFileSync(state, userId);
}

export async function applyFileSync(state: SyncState, userId: string) {

  for (const library of state.libraries) {

  if (library.deletedAt) continue;

  if(library.iconUrl)
    {
      await saveIconFromOnlineStorage(userId, library);
    }
  }

  for (const media of state.media)
  {
    // do not resurrect dead media
    if(media.deletedAt) continue;

    if (!media.filepath)
    {
      console.warn(`Media ${media.id} has no filepath`);
      continue;
    }

    // Media files are immutable, so only download a missing local file.
    if (await fileExistsLocally(media.filepath)) continue;

    await saveMediaFromOnlineStorage(userId, media.filepath, media.filename);
  }
}

async function saveIconFromOnlineStorage(userId: string, library: Library): Promise<void>
{
  if (!library.iconUrl) return;

  const iconFullOnlineStoragePath = getRemoteFileUrl(userId, library.iconUrl);

  const response = await fetch(`${iconFullOnlineStoragePath}`);

  const iconRelativePath = library.iconUrl;
  if (!(await checkResponse(response, iconRelativePath))) return;

  const blob = await response.blob();
  const filename = iconRelativePath.split("/").at(-1) ?? "icon";
  const file = new File([blob], filename, { type: blob.type });
  await saveLocalFile(file, iconRelativePath);
}

async function saveMediaFromOnlineStorage(userId: string, mediaRelativePath: string, mediaFilename: string): Promise<void>
{
  const mediaFullOnlineStoragePath = getRemoteFileUrl(userId, mediaRelativePath);

  const response = await fetch(mediaFullOnlineStoragePath);

  if (!(await checkResponse(response, mediaRelativePath))) return;

  const blob = await response.blob();
  const file = new File([blob], mediaFilename, { type: blob.type });
  await saveLocalFile(file, mediaRelativePath)
}

function getRemoteFileUrl(userId: string, relativePath: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const encodedPath = relativePath
    .replace(/^\/+/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return `${apiUrl}/media_storage/${encodeURIComponent(userId)}/${encodedPath}`;
}

async function checkResponse(response: Response, filepath: string): Promise<boolean>
{
  if (response.ok) return true;

  console.warn(`File not found on server: ${filepath} (${response.status})`);
  return false;
}
