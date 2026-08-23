import { SQLiteDBConnection } from "@capacitor-community/sqlite";



export class NoteRepository{

    private db: SQLiteDBConnection;

    constructor(dbConnection: SQLiteDBConnection)
    {
        this.db = dbConnection;
    }

    async initTable(): Promise<void>
    {
        await this.db.execute(`
        CREATE TABLE IF NOT EXISTS note (
            id TEXT PRIMARY KEY NOT NULL,

            media_id TEXT NOT NULL,

            title TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT,

            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            deleted_at TEXT,

            version INTEGER NOT NULL DEFAULT 0,

            FOREIGN KEY (media_id)
            REFERENCES media(id)
            ON DELETE CASCADE
        );
        `);
    }
}