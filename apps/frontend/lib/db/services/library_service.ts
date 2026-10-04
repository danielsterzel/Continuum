import type { Library } from "@/lib/types/Library";
import { getDatabase } from "../database";
import { LibraryRepository } from "../repositories/library_repository";
import { queueEntityChange } from "@/lib/sync/sync";
import { SyncOperation } from "@/lib/types/SyncOperation";
import {
  deleteFileFromLocalStorage,
  saveLocalFile,
} from "@/lib/files/LocalFileStorage";

export type LibraryUpdate = {
  name?: string;
  description?: string | null;
  icon?: File | null;
};

export async function getLibrary(userId: string, libraryId: string) {
  const db = await getDatabase();
  const repository = new LibraryRepository(db);

  return repository.getByLibId(userId, libraryId);
}

export async function getLibraries(userId: string) {
  const db = await getDatabase();
  const repository = new LibraryRepository(db);

  return repository.getAllForUser(userId);
}
export async function saveLibraryToDb(library: Library) {
  const db = await getDatabase();
  const repository = new LibraryRepository(db);

  return repository.add(library);
}

function getFileExtension(file: File): string {
  const extensionFromName = file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1];
  if (extensionFromName) return extensionFromName.toLowerCase();

  const extensionsByMimeType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };

  return extensionsByMimeType[file.type.toLowerCase()] ?? "bin";
}

export async function updateLibrary(
  userId: string,
  libraryId: string,
  deviceId: string,
  changes: LibraryUpdate,
): Promise<Library | null> {
  const db = await getDatabase();
  const repository = new LibraryRepository(db);
  const existingLibrary = await repository.getByLibId(userId, libraryId);

  if (!existingLibrary) return null;

  let nextIconUrl = existingLibrary.iconUrl;
  if (changes.icon !== undefined && changes.icon !== null) {
    nextIconUrl = `${libraryId}/icon.${getFileExtension(changes.icon)}`;
    await saveLocalFile(changes.icon, nextIconUrl);
  } else if (changes.icon === null) {
    nextIconUrl = "";
  }

  const updatedLibrary: Library = {
    ...existingLibrary,
    name: changes.name?.trim() || existingLibrary.name,
    description:
      changes.description === undefined
        ? existingLibrary.description
        : (changes.description?.trim() ?? ""),
    iconUrl: nextIconUrl,
    updatedAt: new Date().toISOString(),
  };

  await queueEntityChange(updatedLibrary, SyncOperation.UPDATE, deviceId);
  await repository.update(userId, updatedLibrary);

  if (
    changes.icon !== undefined &&
    existingLibrary.iconUrl &&
    existingLibrary.iconUrl !== nextIconUrl
  ) {
    try {
      await deleteFileFromLocalStorage(existingLibrary.iconUrl);
    } catch (error) {
      console.warn(
        `Library updated, but the previous icon could not be deleted: ${existingLibrary.iconUrl}`,
        error,
      );
    }
  }

  return updatedLibrary;
}

export async function deleteLibrary(library: Library, deviceId: string) {
  const db = await getDatabase();
  const repository = new LibraryRepository(db);

  await queueEntityChange(library, SyncOperation.DELETE, deviceId);
  await repository.deleteLibraryById(library.userId, library.id);
}
