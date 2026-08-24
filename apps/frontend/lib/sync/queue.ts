import { v4 } from "uuid";
import type { SyncChange } from "@/types/sync_change";
import { SyncQueueRepository } from "../db/repositories/sync_queue_repository";
import { getDatabase } from "../db/database";

export async function enqueueChange(syncEntity: SyncChange): Promise<void> {
  const id = syncEntity.id ?? v4();
  const change: SyncChange = {
    ...syncEntity,
    id,
  };

  const db = await getDatabase();
  const syncQueueRepository = new SyncQueueRepository(db);

  await syncQueueRepository.add(change);
}

export async function getPendingChanges(): Promise<SyncChange[]> {
  const db = await getDatabase();
  const syncQueueRepository = new SyncQueueRepository(db);

  return await syncQueueRepository.getPendingChanges();
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await getDatabase();
  const syncQueueRepository = new SyncQueueRepository(db);

  await syncQueueRepository.remove(id);
}
