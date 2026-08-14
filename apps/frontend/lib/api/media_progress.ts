import type {
  MediaProgressRead,
  MediaProgressWrite,
} from "@/types/media_progress";

const API_BASE = "http://127.0.0.1:8000";
const API_PREFIX = API_BASE + "/media_progress";

type FetchProps = {
  userId: string;
  libraryId: string;
  mediaId: string;
};

export async function fetchMediaProgresForMedia(
  request: FetchProps,
): Promise<MediaProgressRead> {
  const { userId, libraryId, mediaId } = request;

  const res = await fetch(
    `${API_PREFIX}/recent/${userId}/${libraryId}/${mediaId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
  if (!res.ok) {
    throw new Error(`HTTP Exception: ${res.status}`);
  }
  const data = await res.json();
  return data as MediaProgressRead;
}

export async function postMediaProgress(
  request: FetchProps,
  updatedMediaProgress: MediaProgressWrite,
): Promise<void> {
  const { userId, libraryId, mediaId } = request;
  const post = await fetch(
    `${API_PREFIX}/update/${userId}/${libraryId}/${mediaId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedMediaProgress),
    },
  );


  if (!post.ok) {
    console.log(await post.json());
    throw new Error(`HTTP Exception with status: ${post.status}`);
  }
}
