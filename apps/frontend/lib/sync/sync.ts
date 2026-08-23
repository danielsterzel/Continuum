import type { SyncChangeWrite, SyncOperation } from "@/types/sync_change";
import { enqueueChange, getQueue, removeFromQueue } from "./queue";
import { EntityUnionType } from "@/types/entity_union";
import { mapEntityToSync } from "../entity_sync_mapper";

const BATCH_SIZE = 20;


async function postSyncChanges(
  syncChangeWrites: SyncChangeWrite[],
): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/initiate`, {
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

export async function batchAndSend(): Promise<void> {
  const entries = Object.entries(getQueue());

  if (entries.length === 0) {
    return;
  }

  const batch = entries.slice(0, BATCH_SIZE);

  const changes = batch.map(([, change]) => {
    const { id, createdAt, ...syncChange } = change;
    return syncChange;
  });

  await postSyncChanges(changes);

  for (const [id] of batch) {
    removeFromQueue(id);
  }
}

export function queueEntityChange(
  entityArg: EntityUnionType,
  operation: SyncOperation,
  deviceId: string
)
{
  const {syncChange} = mapEntityToSync(entityArg, operation, deviceId);

  enqueueChange(syncChange);

}