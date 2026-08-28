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
      CREATE TABLE IF NOT EXISTS sync_changes (
        id TEXT PRIMARY KEY NOT NULL,

        device_id TEXT NOT NULL,

        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,

        operation TEXT NOT NULL,

        expected_version INTEGER NOT NULL,

        payload TEXT,

        created_at TEXT NOT NULL,

        FOREIGN KEY (device_id)
          REFERENCES devices(id)
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

      CREATE INDEX IF NOT EXISTS ix_sync_changes_entity
      ON sync_changes(entity_type, entity_id);

      CREATE INDEX IF NOT EXISTS ix_sync_changes_device
      ON sync_changes(device_id);
    `);
  }

  async remove(syncId: string) {
    await this.db.run(
      `
      DELETE FROM sync_changes WHERE sync_changes.id = ?`,
      [syncId],
    );

    await persistDatabase();
  }
  async add(syncChange: SyncChange): Promise<void> {
    const payload = JSON.stringify(syncChange.payload);
    await this.db.run(
      `
    INSERT INTO sync_changes (
      id,
      device_id,
      entity_type,
      entity_id,
      operation,
      expected_version,
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
        syncChange.expectedVersion,
        payload,
        syncChange.createdAt,
      ],
    );
    await persistDatabase();
  }

  async getPendingChanges(): Promise<SyncChange[]> {
    const res = await this.db.query(`SELECT * FROM sync_changes`);
    const rows = res.values ?? [];

    return rows.map((row) => ({
      id: row.id,
      deviceId: row.device_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      operation: row.operation,
      expectedVersion: row.expected_version,
      payload: JSON.parse(row.payload),
      createdAt: row.created_at,
    }));
  }
}
