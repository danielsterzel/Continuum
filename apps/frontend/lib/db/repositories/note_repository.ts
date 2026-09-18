import type { Note } from "@/lib/types/Note";
import { EntityType } from "@/lib/types/EntityType";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";

import { persistDatabase } from "../database";
import { SyncChange } from "@/lib/types/SyncChange";

type NoteRow = {
  id: string;
  media_id: string;
  title: string;
  content: string;
  timestamp: number | string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  version: number;
};

export class NoteRepository {
  private db: SQLiteDBConnection;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }

  private mapRowToNote(row: NoteRow): Note {
    return {
      id: row.id,
      mediaId: row.media_id,
      title: row.title,
      content: row.content,
      timestamp: row.timestamp === null ? null : Number(row.timestamp),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      version: row.version,
      entityType: EntityType.Note,
    };
  }

  async initTable(): Promise<void> {
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

      CREATE INDEX IF NOT EXISTS ix_notes_media_id
      ON notes(media_id);
    `);
  }

  async add(note: Note): Promise<void> {
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
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

  async getAllByMediaId(userId: string, mediaId: string): Promise<Note[]> {
    const result = await this.db.query(
      `
      SELECT notes.*
      FROM notes
      JOIN media ON media.id = notes.media_id
      JOIN libraries ON libraries.id = media.library_id
      WHERE libraries.user_id = ?
        AND notes.media_id = ?
        AND notes.deleted_at IS NULL
      ORDER BY notes.created_at DESC;
      `,
      [userId, mediaId],
    );

    return (result.values ?? []).map((row) => this.mapRowToNote(row));
  }

  async getById(userId: string, noteId: string): Promise<Note | null> {
    const result = await this.db.query(
      `
      SELECT notes.*
      FROM notes
      JOIN media ON media.id = notes.media_id
      JOIN libraries ON libraries.id = media.library_id
      WHERE libraries.user_id = ?
        AND notes.id = ?
        AND notes.deleted_at IS NULL
      LIMIT 1;
      `,
      [userId, noteId],
    );

    const row = result.values?.[0];

    return row ? this.mapRowToNote(row) : null;
  }

  async update(userId: string, note: Note): Promise<void> {
    const result = await this.db.run(
      `
      UPDATE notes
      SET title = ?,
          content = ?,
          timestamp = ?,
          updated_at = ?,
          deleted_at = ?,
          version = ?
      WHERE id = ?
        AND EXISTS (
          SELECT 1
          FROM media
          JOIN libraries ON libraries.id = media.library_id
          WHERE media.id = notes.media_id
            AND libraries.user_id = ?
        );
      `,
      [
        note.title,
        note.content,
        note.timestamp,
        note.updatedAt,
        note.deletedAt,
        note.version,
        note.id,
        userId,
      ],
    );

    if (result.changes?.changes !== 1) {
      throw new Error(`Cannot update note ${note.id}`);
    }

    await persistDatabase();
  }

  async deleteById(userId: string, noteId: string): Promise<void> {
    const result = await this.db.run(
      `
      DELETE FROM notes
      WHERE id = ?
        AND EXISTS (
          SELECT 1
          FROM media
          JOIN libraries ON libraries.id = media.library_id
          WHERE media.id = notes.media_id
            AND libraries.user_id = ?
        );
      `,
      [noteId, userId],
    );

    if (result.changes?.changes !== 1) {
      throw new Error(`Cannot delete note ${noteId}`);
    }

    await persistDatabase();
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
  async getByNoteId(userId: string, noteId: string)
  {
    const res = await this.db.query(`
      SELECT n.* from notes n 
      JOIN media m ON(n.media_id = m.id)
      JOIN libraries l ON(m.library_id = l.id)
      WHERE l.user_id = ? AND n.id = ? LIMIT 1`, [userId, noteId]);
    
      const rows = res?.values?.[0]

      return rows ? this.mapRowToNote(rows): null;
  }
}
