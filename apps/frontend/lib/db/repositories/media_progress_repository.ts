import { SQLiteDBConnection } from "@capacitor-community/sqlite";



export class MediaProgressRepository
{
    private db: SQLiteDBConnection

    constructor(dbConnection : SQLiteDBConnection)
    {
        this.db = dbConnection;
    }
    async initTable(): Promise<void>
    {
        await this.db.execute(`
        CREATE TABLE IF NOT EXISTS media_progress (
            id TEXT PRIMARY KEY NOT NULL,

            media_id TEXT NOT NULL,
            current_position TEXT,
            last_watched TEXT NOT NULL,
            last_device_id TEXT,

            deleted_at TEXT,
            version INTEGER NOT NULL DEFAULT 0,

            FOREIGN KEY (media_id)
            REFERENCES media(id)
            ON DELETE CASCADE,

            FOREIGN KEY (last_device_id)
            REFERENCES device(id)
            ON DELETE SET NULL,

            UNIQUE (media_id)
        );
        `);
    }

}