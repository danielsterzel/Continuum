import { SyncChange } from "@/types/sync_change";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { persistDatabase } from "../database";

export class SyncQueueRepository {
  private db: SQLiteDBConnection;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }

  async initTable(): Promise<void> {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY NOT NULL,

        device_id TEXT NOT NULL,

        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,

        operation TEXT NOT NULL,

        base_version INTEGER NOT NULL,

        payload TEXT,

        created_at TEXT NOT NULL,

        FOREIGN KEY (device_id)
          REFERENCES device(id)
          ON DELETE CASCADE,

        CHECK (
          entity_type IN (
            'note',
            'library',
            'media',
            'media_progress',
            'device'
          )
        ),

        CHECK (
          operation IN (
            'create',
            'update',
            'delete'
          )
        )
      );

      CREATE INDEX IF NOT EXISTS ix_sync_queue_entity
      ON sync_queue(entity_type, entity_id);

      CREATE INDEX IF NOT EXISTS ix_sync_queue_device
      ON sync_queue(device_id);
    `);
  }

  async remove(syncId: string) {
    await this.db.run(
      `
      DELETE from sync_queue where sync_queue.id = ?`,
      [syncId],
    );

    await persistDatabase();
  }
  async add(syncChange: SyncChange): Promise<void> {
    const payload = JSON.stringify(syncChange.payload);
    await this.db.run(
      `
    INSERT INTO sync_queue (
      id,
      device_id,
      entity_type,
      entity_id,
      operation,
      base_version,
      payload,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `,
      [
        syncChange.id,
        syncChange.deviceId,
        syncChange.entityType,
        syncChange.entityId,
        syncChange.operation,
        syncChange.baseVersion,
        payload,
        syncChange.createdAt,
      ],
    );
    await persistDatabase();
  }

  async getPendingChanges(): Promise<SyncChange[]> {
    const res = await this.db.query(`SELECT * from sync_queue`);
    const rows = res.values ?? [];

    return rows.map((row) => ({
      id: row.id,
      deviceId: row.device_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      operation: row.operation,
      baseVersion: row.base_version,
      payload: JSON.parse(row.payload),
      createdAt: row.created_at,
    }));
  }
}
