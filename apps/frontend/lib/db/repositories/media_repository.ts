import { Media } from "@/types/media";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { persistDatabase } from "../database";
export class MediaRepository {
  private db: SQLiteDBConnection;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
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
}
