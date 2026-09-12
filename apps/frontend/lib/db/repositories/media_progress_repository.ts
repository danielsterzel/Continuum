import { MediaProgress } from "@/lib/types/MediaProgress";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { persistDatabase } from "../database";
import { EntityType } from "@/lib/types/EntityType";

export class MediaProgressRepository {
  private db: SQLiteDBConnection;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }
  async initTable(): Promise<void> {
    await this.db.execute(`
        CREATE TABLE IF NOT EXISTS media_progresses (
            id TEXT PRIMARY KEY NOT NULL,

            media_id TEXT NOT NULL,
            current_position TEXT,
            last_watched TEXT NOT NULL,
            last_device_id TEXT,

            version INTEGER NOT NULL DEFAULT 0,

            FOREIGN KEY (media_id)
            REFERENCES media(id)
            ON DELETE CASCADE,

            FOREIGN KEY (last_device_id)
            REFERENCES devices(id)
            ON DELETE SET NULL,

            UNIQUE (media_id)
        );
        `);
  }

  async upsertFromSync(progress: MediaProgress): Promise<void> {
    await this.db.run(
      `
    INSERT INTO media_progresses (
      id,
      media_id,
      current_position,
      last_watched,
      last_device_id,
      version
    )
    VALUES (?, ?, ?, ?, ?, ?)

    ON CONFLICT(id) DO UPDATE SET
      media_id = excluded.media_id,
      current_position = excluded.current_position,
      last_watched = excluded.last_watched,
      last_device_id = excluded.last_device_id,
      version = excluded.version;
    `,
      [
        progress.id,
        progress.mediaId,
        progress.currentPosition,
        progress.lastWatched,
        progress.lastDeviceId,
        progress.version,
      ],
    );

    await persistDatabase();
  }

  async getMediaProgressById(
    userId: string,
    libraryId: string,
    mediaId: string,
  ): Promise<MediaProgress | null> {
    const res = await this.db.query(
      `SELECT mp.* FROM media_progresses mp
    JOIN media m ON mp.media_id = m.id
    JOIN libraries l ON m.library_id = l.id WHERE l.user_id = ?
    AND m.library_id = ?
    AND mp.media_id = ?
    `,
      [userId, libraryId, mediaId],
    );

    const row = res.values?.[0];
    if(!row)
      {
        return null;
      }

    return this.mapRowToObject(row);
  }
  async saveMediaProgress(progress: MediaProgress): Promise<void> {
    await this.db.run(
      `
    INSERT INTO media_progresses (
      id,
      media_id,
      current_position,
      last_watched,
      last_device_id,
      version
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        progress.id,
        progress.mediaId,
        progress.currentPosition,
        progress.lastWatched,
        progress.lastDeviceId,
        progress.version,
      ],
    );

    await persistDatabase();
  }

  async upsertMediaProgress(progress: MediaProgress): Promise<void> {
    await this.db.run(
      `
    INSERT INTO media_progresses (
      id,
      media_id,
      current_position,
      last_watched,
      last_device_id,
      version
    )
    VALUES (?, ?, ?, ?, ?, ?)

    ON CONFLICT(media_id) DO UPDATE SET
      current_position = excluded.current_position,
      last_watched = excluded.last_watched,
      last_device_id = excluded.last_device_id,
      version = excluded.version
    `,
      [
        progress.id,
        progress.mediaId,
        progress.currentPosition,
        progress.lastWatched,
        progress.lastDeviceId,
        progress.version,
      ],
    );

    await persistDatabase();
  }
  mapRowToObject(row: any) {
    return {
      id: row.id,
      mediaId: row.media_id,
      currentPosition: row.current_position,
      lastWatched: row.last_watched,
      lastDeviceId: row.last_device_id,
      version: row.version,
      entityType: EntityType.MediaProgress,
    } as MediaProgress;
  }
}
