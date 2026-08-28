import { Library } from "@/types/library";
import { EntityType } from "@/types/sync_change";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";

export class LibraryRepository {
  private db: SQLiteDBConnection;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }

  private mapRowToLibrary(row: any): Library {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description ?? undefined,
      iconUrl: row.icon_url ?? "",

      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      version: row.version,
      entityType: EntityType.Library,
    };
  }

  async initTable(): Promise<void> {
    await this.db.execute(`
        CREATE TABLE IF NOT EXISTS libraries (
            id TEXT PRIMARY KEY NOT NULL,

            user_id TEXT NOT NULL,

            name TEXT NOT NULL,
            description TEXT,
            icon_url TEXT,

            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            deleted_at TEXT,

            version INTEGER NOT NULL DEFAULT 0,

            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

            UNIQUE (user_id, name)
        );

        CREATE INDEX IF NOT EXISTS ix_library_user_id
        ON libraries(user_id);
        `);
  }

  async upsertFromSync(library: Library): Promise<void> {
    // get local iconUrl

    console.log("UPSERT FROM SYNC");
    console.log("library:", library);
    console.log("createdAt:", library.createdAt);
    console.log("updatedAt:", library.updatedAt);

    await this.db.run(
      `
    INSERT INTO libraries (
      id,
      user_id,
      name,
      description,
      icon_url,
      created_at,
      updated_at,
      deleted_at,
      version
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT(id) DO UPDATE SET
      user_id = excluded.user_id,
      name = excluded.name,
      description = excluded.description,
      icon_url = excluded.icon_url,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      deleted_at = excluded.deleted_at,
      version = excluded.version;
    `,
      [
        library.id,
        library.userId,
        library.name,
        library.description,
        library.iconUrl,
        library.createdAt,
        library.updatedAt,
        library.deletedAt,
        library.version,
      ],
    );
  }

  async getByLibId(userId: string, libraryId: string): Promise<Library | null> {
    const res = await this.db.query(
      `SELECT * FROM libraries WHERE user_id = ? AND id = ?`,
      [userId, libraryId],
    );

    const row = res.values?.[0];

    if (!row) {
      return null;
    }

    return this.mapRowToLibrary(row);
  }

  async getAllForUser(userId: string): Promise<Library[]> {
    const res = await this.db.query(
      `SELECT * from libraries WHERE libraries.user_id = ?`,
      [userId],
    );

    const rows = res.values ?? [];

    return rows.map((row) => this.mapRowToLibrary(row));
  }

  async add(library: Library) {
    console.log("ADD LIBRARY");
    console.log("library:", library);
    console.log("createdAt:", library.createdAt);
    console.log("updatedAt:", library.updatedAt);

    await this.db.run(
      `
      INSERT INTO libraries (
      id,
      user_id,
      name,
      description,
      icon_url,
      created_at,
      updated_at,
      deleted_at,
      version
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        library.id,
        library.userId,
        library.name,
        library.description,
        library.iconUrl,
        library.createdAt,
        library.updatedAt,
        library.deletedAt,
        library.version,
      ],
    );
  }
}