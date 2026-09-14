import type { User } from "@/lib/types/User";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";

import { persistDatabase } from "../database";

export class LocalUserRepository {
  private db: SQLiteDBConnection;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }

  async initTable(): Promise<void> {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS local_user (
        id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
        user_id TEXT NOT NULL UNIQUE,

        FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);
  }

  async set(userId: string): Promise<void> {
    await this.db.run(
      `
      INSERT INTO local_user (id, user_id)
      VALUES (1, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id;
      `,
      [userId],
    );

    await persistDatabase();
  }

  async get(): Promise<User | null> {
    const result = await this.db.query(`
      SELECT users.*
      FROM local_user
      JOIN users ON users.id = local_user.user_id
      WHERE local_user.id = 1
      LIMIT 1;
    `);

    const row = result.values?.[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async delete(): Promise<void> {
    await this.db.run(`DELETE FROM local_user WHERE id = 1;`);
    await persistDatabase();
  }
}
