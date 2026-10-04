import { getDatabase } from "../database";
import { EntityType } from "@/lib/types/EntityType";
import type { Media } from "@/lib/types/Media";
import type { MediaProgress } from "@/lib/types/MediaProgress";

export type LastWatchedVideo = {
  media: Media;
  mediaProgress: MediaProgress;
};

type LastWatchedVideoRow = {
  media_id: string;
  library_id: string;
  filename: string;
  filepath: string;
  file_size: number;
  media_type: string;
  duration: number | string | null;
  thumbnail_url: string | null;
  rating: number | null;
  media_created_at: string;
  media_updated_at: string;
  media_deleted_at: string | null;
  media_expected_version: number;
  progress_id: string;
  current_position: number | string | null;
  last_watched: string;
  last_device_id: string | null;
  progress_expected_version: number;
};

export async function getLastWatchedVideo(
  userId: string,
): Promise<LastWatchedVideo | null> {
  const db = await getDatabase();

  const result = await db.query(
    `
      SELECT
        m.id AS media_id,
        m.library_id,
        m.filename,
        m.filepath,
        m.file_size,
        m.media_type,
        m.duration,
        m.thumbnail_url,
        m.rating,
        m.created_at AS media_created_at,
        m.updated_at AS media_updated_at,
        m.deleted_at AS media_deleted_at,
        m.expected_version AS media_expected_version,
        mp.id AS progress_id,
        mp.current_position,
        mp.last_watched,
        mp.last_device_id,
        mp.expected_version AS progress_expected_version
      FROM media_progresses mp
      JOIN media m ON m.id = mp.media_id
      JOIN libraries l ON l.id = m.library_id
      WHERE l.user_id = ?
        AND l.deleted_at IS NULL
        AND m.deleted_at IS NULL
        AND m.media_type = 'video'
      ORDER BY mp.last_watched DESC
      LIMIT 1;
    `,
    [userId],
  );

  const row = result.values?.[0] as LastWatchedVideoRow | undefined;
  if (!row) return null;

  return {
    media: {
      id: row.media_id,
      libraryId: row.library_id,
      filename: row.filename,
      filepath: row.filepath,
      fileSize: Number(row.file_size),
      mediaType: row.media_type,
      duration: parseDurationInSeconds(row.duration),
      thumbnailUrl: row.thumbnail_url,
      rating: row.rating,
      createdAt: row.media_created_at,
      updatedAt: row.media_updated_at,
      deletedAt: row.media_deleted_at,
      expectedVersion: Number(row.media_expected_version),
      entityType: EntityType.Media,
    },
    mediaProgress: {
      id: row.progress_id,
      mediaId: row.media_id,
      currentPosition:
        row.current_position === null ? null : Number(row.current_position),
      lastWatched: row.last_watched,
      lastDeviceId: row.last_device_id,
      expectedVersion: Number(row.progress_expected_version),
      entityType: EntityType.MediaProgress,
    },
  };
}

function parseDurationInSeconds(
  duration: number | string | null,
): number | null {
  if (duration === null) return null;

  const numericDuration = Number(duration);
  if (Number.isFinite(numericDuration)) return numericDuration;

  const isoDuration = String(duration).match(
    /^P(?:(\d+(?:\.\d+)?)D)?T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/i,
  );
  if (!isoDuration) return null;

  const [, days = "0", hours = "0", minutes = "0", seconds = "0"] = isoDuration;

  return (
    Number(days) * 86_400 +
    Number(hours) * 3_600 +
    Number(minutes) * 60 +
    Number(seconds)
  );
}
