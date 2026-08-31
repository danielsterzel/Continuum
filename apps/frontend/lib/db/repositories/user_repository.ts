import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import type { User } from "@/lib/types/User";
import { persistDatabase } from "../database";

export class UserRepository {
  private db: SQLiteDBConnection;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }

  async initTable(): Promise<void> {
    await this.db.execute(`
            CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY NOT NULL,
            email TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS ix_users_email
        ON users(email);`);
  }
  async add(user: {
    id: string;
    email: string;
    displayName: string;
    createdAt: string;
    updatedAt: string;
  }): Promise<void> {
    await this.db.run(
      `
    INSERT INTO users (
      id,
      email,
      display_name,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?);
    `,
      [user.id, user.email, user.displayName, user.createdAt, user.updatedAt],
    );

    await persistDatabase();
  }
  async get(): Promise<User | null> {
  const result = await this.db.query(`
    SELECT *
    FROM users
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
}
