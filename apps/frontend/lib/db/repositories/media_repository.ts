import { SQLiteDBConnection } from "@capacitor-community/sqlite";

export class MediaRepository {
  private db: SQLiteDBConnection;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }

  async initTable(): Promise<void> 
  {
    await this.db.execute(`
        CREATE TABLE IF NOT EXISTS media (
            id TEXT PRIMARY KEY NOT NULL,

            library_id TEXT NOT NULL,

            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
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
}
