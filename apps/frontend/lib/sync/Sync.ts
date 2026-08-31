import type { SyncChangeWrite } from "../types/SyncChange";
import { SyncOperation } from "../types/SyncOperation";
import { enqueueChange, getPendingChanges, removeFromQueue } from "./queue";
import { EntityUnionType } from "../types/EntityUnion";
import { mapEntityToSync } from "../EntitySyncMapper";
import { fetchSyncState, pushIconFileData } from "../api/sync";
import { applySyncState } from "./apply_sync_state";
import { EntityType } from "../types/EntityType";
import { getLibrary } from "../db/services/library_service";
import { getFullFilepath, getFullFile } from "../files/LocalFileStorage";
const BATCH_SIZE = 20;

async function postSyncChanges(
  syncChangeWrites: SyncChangeWrite[],
  userId: string,
): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/sync/initiate/${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(syncChangeWrites),
    },
  );

  if (!res.ok) {
    throw new Error(`SYNC: HTTP error ${res.status}`);
  }

  // TODO: Change so that icon is not downloaded everytime there is a change to library
  for (const syncChangeWrite of syncChangeWrites) {
    if (syncChangeWrite.entityType === EntityType.Library) {
      const lib = await getLibrary(userId, syncChangeWrite.entityId);
      console.log("LIB ICON URL: ", lib?.iconUrl);
      if (!lib?.iconUrl) {
        continue;
      }
      const localFile = await getFullFile(lib.iconUrl);

      if (!localFile ) {
        console.log("FAILED TO PUSH");
        continue;
      }
      await pushIconFileData(localFile, lib.iconUrl, userId);
    }
  }
}

export async function syncCycle(userId: string): Promise<void> {
  await batchAndSend(userId);

  const remainingChanges = await getPendingChanges();

  if (remainingChanges.length > 0) {
    return;
  }

  const state = await fetchSyncState(userId);

  await applySyncState(state, userId);
}

export async function batchAndSend(userId: string): Promise<void> {
  const pendingChanges = await getPendingChanges();

  if (pendingChanges.length === 0) {
    return;
  }

  const batch = pendingChanges.slice(0, BATCH_SIZE);

  const changes = batch.map((change) => {
    const { id, createdAt, ...syncChange } = change;
    return syncChange;
  });

  await postSyncChanges(changes, userId);

  for (const change of batch) {
    await removeFromQueue(change.id);
  }
}

export async function queueEntityChange(
  entityArg: EntityUnionType,
  operation: SyncOperation,
  deviceId: string,
): Promise<void> {
  const { syncChange } = mapEntityToSync(entityArg, operation, deviceId);

  await enqueueChange(syncChange);
}
