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

export async function pushVideoFileData(blob: Blob, relpath: string, userId: string, libraryId: string)
{
  const data = prepareMediaDataForPush(blob, relpath);
  data.append("user_id", userId);
  data.append("library_id", libraryId);
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/media/file/`, {
    method: "POST",
    body: data
  })

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.status}`);
  }

}
export async function pushIconFileData(blob: Blob, iconUrl: string, userId: string)
{
  const data = prepareMediaDataForPush(blob, iconUrl);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/icon/${userId}`, {
    method: "POST",
    body: data
  });

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.status}`);
  }
}

function prepareMediaDataForPush(blob: Blob, path: string)
{
  const formData = new FormData();
  formData.append("file", blob);
  formData.append("path", path);

  return formData;
}
