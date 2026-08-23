
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";



const sqlite = new SQLiteConnection(CapacitorSQLite);

let db: SQLiteDBConnection | null = null;

export async function getDatabase(): Promise <SQLiteDBConnection> 
{
    if(db) return db;

    db = await sqlite.createConnection("continuum", false, "no-encryption", 1, false);

    await db.open();
    await db.execute(`PRAGMA foreign_keys = ON;`);

    return db;
}
