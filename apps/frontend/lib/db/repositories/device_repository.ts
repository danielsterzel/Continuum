import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import type { Device } from "@/lib/types/Device";
import { EntityType } from "@/lib/types/EntityType";
import { persistDatabase } from "../database";

export class DeviceRepository {
  private db: SQLiteDBConnection;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }

  async initTable(): Promise<void> {
    await this.db.execute(
      `
            CREATE TABLE IF NOT EXISTS devices (
                id TEXT PRIMARY KEY NOT NULL,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                last_seen TEXT NOT NULL,
                deleted_at TEXT,
                version INTEGER NOT NULL DEFAULT 0,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            );
        `,
    );
  }
  async add(device: Device): Promise<void> {
    await this.db.run(
      `
    INSERT INTO devices (
      id,
      user_id,
      name,
      last_seen,
      deleted_at,
      version
    )
    VALUES (?, ?, ?, ?, ?, ?);
    `,
      [
        device.id,
        device.userId,
        device.name,
        device.lastSeen,
        device.deletedAt,
        device.version,
      ],
    );
    await persistDatabase();
  }

  async get(): Promise<Device | null> {
    const result = await this.db.query(`
      SELECT *
      FROM devices
      WHERE deleted_at IS NULL
      LIMIT 1;
    `);

    const row = result.values?.[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      lastSeen: row.last_seen,
      deletedAt: row.deleted_at,
      version: row.version,
      entityType: EntityType.Device,
    };
  }
}
