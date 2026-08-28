import { Note } from "@/types/note";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { persistDatabase } from "../database";



export class NoteRepository{

    private db: SQLiteDBConnection;

    constructor(dbConnection: SQLiteDBConnection)
    {
        this.db = dbConnection;
    }

    async initTable(): Promise<void>
    {
        await this.db.execute(`
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY NOT NULL,

            media_id TEXT NOT NULL,

            title TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT,

            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            deleted_at TEXT,

            version INTEGER NOT NULL DEFAULT 0,

            FOREIGN KEY (media_id)
            REFERENCES media(id)
            ON DELETE CASCADE
        );
        `);
    }
    async upsertFromSync(note: Note): Promise<void> {
  await this.db.run(
    `
    INSERT INTO notes (
      id,
      media_id,
      title,
      content,
      timestamp,
      created_at,
      updated_at,
      deleted_at,
      version
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT(id) DO UPDATE SET
      media_id = excluded.media_id,
      title = excluded.title,
      content = excluded.content,
      timestamp = excluded.timestamp,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      deleted_at = excluded.deleted_at,
      version = excluded.version;
    `,
    [
      note.id,
      note.mediaId,
      note.title,
      note.content,
      note.timestamp,
      note.createdAt,
      note.updatedAt,
      note.deletedAt,
      note.version,
    ],
  );

  await persistDatabase();
}
}
