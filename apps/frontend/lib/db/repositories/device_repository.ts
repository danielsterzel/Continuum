import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import type { Device } from "@/types/device";
import { EntityType } from "@/types/sync_change";

export class DeviceRepository {
  private db: SQLiteDBConnection;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }

  async initTable(): Promise<void> {
    await this.db.execute(
      `
            CREATE TABLE IF NOT EXISTS device (
                id TEXT PRIMARY KEY NOT NULL,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                last_seen TEXT NOT NULL,
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
    INSERT INTO device (
      id,
      user_id,
      name,
      last_seen,
      version
    )
    VALUES (?, ?, ?, ?, ?);
    `,
      [device.id, device.userId, device.name, device.lastSeen, device.version],
    );
  }

  async get(): Promise<Device | null> {
    const result = await this.db.query(`
      SELECT *
      FROM device
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
      version: row.version,
      entityType: EntityType.Device,
    };
  }
}
