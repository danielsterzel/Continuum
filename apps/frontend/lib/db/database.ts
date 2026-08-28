
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";

import { Capacitor } from "@capacitor/core";


const sqlite = new SQLiteConnection(CapacitorSQLite);

let db: SQLiteDBConnection | null = null;
let webMode = false;

export async function resetDatabaseConnection(): Promise<void> {
    if (db) {
        try {
            await sqlite.closeConnection("continuum", false);
        } catch {}

        db = null;
    }
}

async function initWebDb()
{
    if (Capacitor.getPlatform() !== "web" || webMode)
        {
            return;
        }

    const {defineCustomElements} = await import ("jeep-sqlite/loader");

    defineCustomElements(window);

    if(!document.querySelector("jeep-sqlite"))
        {
            const jeepSqlite = document.createElement("jeep-sqlite");
            document.body.appendChild(jeepSqlite);
        }
    await customElements.whenDefined("jeep-sqlite");
    await sqlite.initWebStore();

    webMode = true;
}

export async function getDatabase(): Promise<SQLiteDBConnection> {

    await initWebDb();

    if (db) {
        const opened = await db.isDBOpen();

        if(!opened.result)
            {
                await db.open();
                await db.execute(`PRAGMA foreign_keys = ON;`)
            }

        return db;
    }


    const connection = await sqlite.createConnection(
        "continuum",
        false,
        "no-encryption",
        1,
        false
    );

    await connection.open();
    await connection.execute(`PRAGMA foreign_keys = ON;`);

    db = connection;

    return db;
}

export async function persistDatabase(): Promise<void> {
  if (Capacitor.getPlatform() !== "web") {
    return;
  }

  await sqlite.saveToStore("continuum");
}
