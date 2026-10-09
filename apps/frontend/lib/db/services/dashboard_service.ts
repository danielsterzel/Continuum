import { getDatabase } from "../database";

export type DashboardNote = {
  id: string;
  title: string;
  content: string;
  timestamp: number | null;
  updatedAt: string;
  mediaId: string;
  mediaFilename: string;
  mediaType: string;
  libraryId: string;
  libraryName: string;
};

export type MediaTypeCount = {
  type: string;
  count: number;
};

export type TopRatedMedia = {
  id: string;
  libraryId: string;
  libraryName: string;
  filename: string;
  mediaType: string;
  rating: number;
  createdAt: string;
};

export type DashboardSnapshot = {
  totalFiles: number;
  totalBytes: number;
  noteCount: number;
  recentNotes: DashboardNote[];
  mediaTypes: MediaTypeCount[];
  topRatedMedia: TopRatedMedia[];
};

type AggregateRow = {
  total_files: number | string | null;
  total_bytes: number | string | null;
  note_count: number | string | null;
};

type NoteRow = {
  id: string;
  title: string;
  content: string;
  timestamp: number | string | null;
  updated_at: string;
  media_id: string;
  media_filename: string;
  media_type: string;
  library_id: string;
  library_name: string;
};

type MediaTypeRow = {
  media_type: string;
  item_count: number | string;
};

type TopRatedMediaRow = {
  id: string;
  library_id: string;
  library_name: string;
  filename: string;
  media_type: string;
  rating: number | string;
  created_at: string;
};

const EMPTY_SNAPSHOT: DashboardSnapshot = {
  totalFiles: 0,
  totalBytes: 0,
  noteCount: 0,
  recentNotes: [],
  mediaTypes: [],
  topRatedMedia: [],
};

export async function getTopRatedMedia(
  userId: string,
): Promise<TopRatedMedia[]> {
  const db = await getDatabase();
  const result = await db.query(
    `
      SELECT
        m.id,
        m.library_id,
        l.name AS library_name,
        m.filename,
        m.media_type,
        m.rating,
        m.created_at
      FROM media m
      JOIN libraries l ON l.id = m.library_id
      WHERE l.user_id = ?
        AND l.deleted_at IS NULL
        AND m.deleted_at IS NULL
        AND m.rating IS NOT NULL
      ORDER BY m.rating DESC, m.created_at DESC
      LIMIT 5;
    `,
    [userId],
  );

  return ((result.values ?? []) as TopRatedMediaRow[]).map((row) => ({
    id: row.id,
    libraryId: row.library_id,
    libraryName: row.library_name,
    filename: row.filename,
    mediaType: row.media_type,
    rating: Number(row.rating),
    createdAt: row.created_at,
  }));
}

export async function getDashboardSnapshot(
  userId: string,
): Promise<DashboardSnapshot> {
  const db = await getDatabase();

  const [aggregateResult, notesResult, mediaTypesResult, topRatedMedia] =
    await Promise.all([
      db.query(
        `
      WITH user_libraries AS (
        SELECT id
        FROM libraries
        WHERE user_id = ? AND deleted_at IS NULL
      )
      SELECT
        (
          SELECT COUNT(*)
          FROM media m
          WHERE m.library_id IN (SELECT id FROM user_libraries)
            AND m.deleted_at IS NULL
        ) AS total_files,
        (
          SELECT COALESCE(SUM(m.file_size), 0)
          FROM media m
          WHERE m.library_id IN (SELECT id FROM user_libraries)
            AND m.deleted_at IS NULL
        ) AS total_bytes,
        (
          SELECT COUNT(*)
          FROM notes n
          JOIN media m ON m.id = n.media_id
          WHERE m.library_id IN (SELECT id FROM user_libraries)
            AND m.deleted_at IS NULL
            AND n.deleted_at IS NULL
        ) AS note_count;
      `,
        [userId],
      ),
      db.query(
        `
      SELECT
        n.id,
        n.title,
        n.content,
        n.timestamp,
        n.updated_at,
        m.id AS media_id,
        m.filename AS media_filename,
        m.media_type,
        l.id AS library_id,
        l.name AS library_name
      FROM notes n
      JOIN media m ON m.id = n.media_id
      JOIN libraries l ON l.id = m.library_id
      WHERE l.user_id = ?
        AND l.deleted_at IS NULL
        AND m.deleted_at IS NULL
        AND n.deleted_at IS NULL
      ORDER BY n.updated_at DESC
      LIMIT 6;
      `,
        [userId],
      ),
      db.query(
        `
      SELECT m.media_type, COUNT(*) AS item_count
      FROM media m
      JOIN libraries l ON l.id = m.library_id
      WHERE l.user_id = ?
        AND l.deleted_at IS NULL
        AND m.deleted_at IS NULL
      GROUP BY m.media_type
      ORDER BY item_count DESC;
      `,
        [userId],
      ),
      getTopRatedMedia(userId),
    ]);

  const aggregate = aggregateResult.values?.[0] as AggregateRow | undefined;
  if (!aggregate) return EMPTY_SNAPSHOT;

  return {
    totalFiles: Number(aggregate.total_files ?? 0),
    totalBytes: Number(aggregate.total_bytes ?? 0),
    noteCount: Number(aggregate.note_count ?? 0),
    recentNotes: ((notesResult.values ?? []) as NoteRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      timestamp: row.timestamp === null ? null : Number(row.timestamp),
      updatedAt: row.updated_at,
      mediaId: row.media_id,
      mediaFilename: row.media_filename,
      mediaType: row.media_type,
      libraryId: row.library_id,
      libraryName: row.library_name,
    })),
    mediaTypes: ((mediaTypesResult.values ?? []) as MediaTypeRow[]).map(
      (row) => ({
        type: row.media_type,
        count: Number(row.item_count),
      }),
    ),
    topRatedMedia,
  };
}
