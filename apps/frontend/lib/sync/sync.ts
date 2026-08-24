import type { SyncChangeWrite, SyncOperation } from "@/types/sync_change";
import { enqueueChange, getPendingChanges, removeFromQueue } from "./queue";
import { EntityUnionType } from "@/types/entity_union";
import { mapEntityToSync } from "../entity_sync_mapper";

const BATCH_SIZE = 20;

async function postSyncChanges(
  syncChangeWrites: SyncChangeWrite[],
  userId: string
): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/initiate/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(syncChangeWrites),
  });

  if (!res.ok) {
    throw new Error(`SYNC: HTTP error ${res.status}`);
  }
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
