import { SQLiteDBConnection } from "@capacitor-community/sqlite";

export class SyncQueueRepository {
  private db: SQLiteDBConnection;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }

  async initTable() : Promise<void>
  {
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
}
