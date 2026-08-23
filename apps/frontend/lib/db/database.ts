
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";

import { Capacitor } from "@capacitor/core";


const sqlite = new SQLiteConnection(CapacitorSQLite);

let db: SQLiteDBConnection | null = null;
let webMode = false;

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
    if (db) return db;

    await initWebDb();

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
