import { SQLiteDBConnection } from "@capacitor-community/sqlite";


export class LibraryRepository
{
    private db: SQLiteDBConnection;

    constructor(dbConnection: SQLiteDBConnection)
    {
        this.db = dbConnection;
    }

    async initTable(): Promise<void> 
    {
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
}