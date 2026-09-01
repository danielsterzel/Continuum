import { Media } from "@/lib/types/Media";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { persistDatabase } from "../database";
import { EntityType } from "@/lib/types/EntityType";
export class MediaRepository {
  private db: SQLiteDBConnection;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }
  mapRowsToMedia(row: any): Media {
    return {
      id: row.id,
      libraryId: row.library_id,
      filename: row.filename,
      fileSize: row.file_size,
      mediaType: row.media_type,
      duration: row.duration,
      thumbnailUrl: row.thumbnail_url ?? "",
      rating: row.rating,

      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      version: row.version,
      entityType: EntityType.Media,
      filepath: row.filepath,
    };
  }
  async initTable(): Promise<void> {
    await this.db.execute(`
        CREATE TABLE IF NOT EXISTS media (
            id TEXT PRIMARY KEY NOT NULL,

            library_id TEXT NOT NULL,

            filename TEXT NOT NULL,
            filepath TEXT,
            file_size INTEGER NOT NULL,

            duration TEXT,
            thumbnail_url TEXT,

            media_type TEXT NOT NULL,

            rating INTEGER,

            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            deleted_at TEXT,

            version INTEGER NOT NULL DEFAULT 0,

            FOREIGN KEY (library_id)
            REFERENCES libraries(id)
            ON DELETE CASCADE,

            CHECK (
            media_type IN (
                'video',
                'recording',
                'image',
                'pdf',
                'unknown'
            )
            ),

            CHECK (
            rating IS NULL OR (rating >= 1 AND rating <= 5)
            )
        );
    `);
  }
  async upsertFromSync(media: Media): Promise<void> {
    await this.db.run(
      `
    INSERT INTO media (
      id,
      library_id,
      filename,
      filepath,
      file_size,
      duration,
      thumbnail_url,
      media_type,
      rating,
      created_at,
      updated_at,
      deleted_at,
      version
    )
    VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT(id) DO UPDATE SET
      library_id = excluded.library_id,
      filename = excluded.filename,

      -- filepath specjalnie NIE ruszamy

      file_size = excluded.file_size,
      duration = excluded.duration,
      thumbnail_url = excluded.thumbnail_url,
      media_type = excluded.media_type,
      rating = excluded.rating,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      deleted_at = excluded.deleted_at,
      version = excluded.version;
    `,
      [
        media.id,
        media.libraryId,
        media.filename,
        media.fileSize,
        media.duration,
        media.thumbnailUrl,
        media.mediaType,
        media.rating,
        media.createdAt,
        media.updatedAt,
        media.deletedAt,
        media.version,
      ],
    );

    await persistDatabase();
  }
  async getTotalSizeByLibraryId(libraryId: string): Promise<number> {
    const res = await this.db.query(
      `
      SELECT COALESCE(SUM(file_size), 0) AS total_size FROM media WHERE library_id = ?
      `,
      [libraryId],
    );

    return res.values?.[0].total_size ?? 0;
  }
  async add(media: Media) {
    await this.db.run(
      `INSERT INTO media (id, library_id, filename, filepath, file_size, duration, thumbnail_url, media_type, rating,
created_at,
      updated_at,
      deleted_at,
      version
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        media.id,
        media.libraryId,
        media.filename,
        media.filepath,
        media.fileSize,
        media.duration ?? null,
        media.thumbnailUrl ?? null,
        media.mediaType,
        media.rating ?? null,
        media.createdAt,
        media.updatedAt,
        media.deletedAt ?? null,
        media.version,
      ],
    );
  }
  async getAllByLibraryId(userId: string, libraryId: string) {
    const res = await this.db.query(
      `SELECT m.* FROM media m JOIN libraries l ON(m.library_id = l.id) WHERE l.user_id = ? AND m.library_id = ?`,
      [userId, libraryId],
    );
    const rows = res.values ?? [];

    return rows.map((row, _) => this.mapRowsToMedia(row));
  }
  async getById(
    userId: string,
    libraryId: string,
    mediaId: string,
  ): Promise<Media | null> {
    const res = await this.db.query(
      `
      SELECT m.* FROM media m JOIN libraries l ON(m.library_id = l.id) WHERE l.user_id = ? AND m.library_id = ? AND m.id = ?`,
      [userId, libraryId, mediaId],
    );

    const row = res.values?.[0];

    if (!row) {
      return null;
    }
    console.log(row);

    return this.mapRowsToMedia(res.values![0]);
  }

  async deleteById(
    userId: string,
    libraryId: string,
    mediaId: string,
  ): Promise<void> {
    const res = await this.db.run(
      `DELETE from media WHERE id = ? AND library_id = ? AND EXISTS(SELECT 1 FROM libraries WHERE libraries.id = media.library_id 
      AND libraries.user_id = ?)`,
      [mediaId, libraryId, userId],
    );

    if (res.changes?.changes !== 1) {
      throw new Error("ERROR IN DELETE MEDIA");
    }
  }
}
