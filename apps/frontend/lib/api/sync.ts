import type { SyncState } from "@/types/sync_state";

export async function fetchSyncState(userId: string): Promise<SyncState> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/sync/state/${userId}`,
  );
  if (!res.ok) {
    throw new Error(`SYNC STATE: HTTP error ${res.status}`);
  }

  return res.json();
}
