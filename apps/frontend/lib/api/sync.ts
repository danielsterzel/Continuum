import type { SyncState } from "../types/SyncState";

export async function fetchSyncState(userId: string): Promise<SyncState> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/sync/state/${userId}`,
  );
  if (!res.ok) {
    throw new Error(`SYNC STATE: HTTP error ${res.status}`);
  }

  return res.json();
}
export async function pushIconFileData(blob: Blob, iconUrl: string, userId: string)
{
  const formData = new FormData();
  formData.append("file", blob);
  formData.append("path", iconUrl);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/icon/${userId}`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.status}`);
  }
}

export async function pushMediaFile(blob: Blob)
{
  
}