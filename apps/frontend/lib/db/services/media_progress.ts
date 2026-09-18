import { MediaProgress } from "@/lib/types/MediaProgress";
import { getDatabase, persistDatabase } from "../database";
import { MediaProgressRepository } from "../repositories/media_progress_repository";
import { v4 } from "uuid";
import { EntityType } from "@/lib/types/EntityType";
import { queueEntityChange } from "@/lib/sync/sync";
import { SyncOperation } from "@/lib/types/SyncOperation";

export async function getVideoProgress(
  userId: string,
  libraryId: string,
  mediaId: string,
  deviceId: string,
): Promise<MediaProgress> {
  const db = await getDatabase();
  const repository = new MediaProgressRepository(db);

  let currentVideoProgress = await repository.getMediaProgressById(
    userId,
    libraryId,
    mediaId,
  );
  if (!currentVideoProgress) {
    currentVideoProgress = await startVideoProgress(mediaId, deviceId);
  }
  return currentVideoProgress;
}

export async function startVideoProgress(
  mediaId: string,
  deviceId: string,
): Promise<MediaProgress> {
  const db = await getDatabase();
  const repository = new MediaProgressRepository(db);

  const initalVideoProgress = createMediaProgressObject(mediaId, deviceId);

  await repository.saveMediaProgress(initalVideoProgress);

  await queueEntityChange(initalVideoProgress, SyncOperation.CREATE, deviceId);

  await persistDatabase();

  return initalVideoProgress;
}

export async function updateMediaProgress(
  userId: string,
  libraryId: string,
  mediaId: string,
  deviceId: string,
  currentPosition: number | null,
): Promise<MediaProgress> {
  const db = await getDatabase();
  const repository = new MediaProgressRepository(db);

  const currProgress = await repository.getMediaProgressById(
    userId,
    libraryId,
    mediaId,
  );

  if (!currProgress) {
    throw new Error("Cannot update non exisitng progress");
  }

  if (currentPosition !== null) {
    currProgress.currentPosition = currentPosition;
  }
  currProgress.lastWatched = new Date().toISOString();
  currProgress.lastDeviceId = deviceId;

  await queueEntityChange(currProgress, SyncOperation.UPDATE, deviceId);
  await repository.upsertMediaProgress(currProgress);

  return currProgress;
}

// helpers
function createMediaProgressObject(
  mediaId: string,
  deviceId: string,
): MediaProgress {
  const id = v4();

  return {
    id: id,
    mediaId: mediaId,
    currentPosition: 0,
    lastWatched: new Date().toISOString(),
    lastDeviceId: deviceId,
    version: 1,
    entityType: EntityType.MediaProgress,
  } as MediaProgress;
}
