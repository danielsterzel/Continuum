"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { GoBackButton } from "@/components/buttons/GoBackButton";
import { getDatabase } from "@/lib/db/database";
import { initializeDatabase } from "@/lib/db/initialize";
import { resetDatabaseConnection } from "@/lib/db/database";

const TABLES = [
  "users",
  "devices",
  "libraries",
  "media",
  "media_progresses",
  "notes",
  "sync_changes",
] as const;

type TableData = Record<string, unknown[]>;

export default function DatabaseDebugPage() {
  const router = useRouter();
  const [data, setData] = useState<TableData>({});
  const [error, setError] = useState<string | null>(null);

  async function loadDatabase() {
    try {
      const db = await getDatabase();

      const result: TableData = {};

      for (const table of TABLES) {
        const queryResult = await db.query(`SELECT * FROM ${table};`);

        console.log("TABLE:", table);
        console.log("QUERY RESULT:", queryResult);
        console.log("KEYS:", Object.keys(queryResult ?? {}));

        result[table] = queryResult.values ?? [];
      }

      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    void loadDatabase();
  }, []);

  return (
    <main className="min-h-screen bg-background p-8 text-text-primary">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <GoBackButton onBack={() => router.back()} />

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">SQLite Debug</h1>

          <button
            onClick={() => void loadDatabase()}
            className="rounded-lg border border-card-border px-4 py-2"
          >
            Refresh
          </button>

          <button
            onClick={async () => {
              const db = await getDatabase();

              if ((await db.isExists()).result) {
                await db.delete();
                await resetDatabaseConnection();

              }

              await initializeDatabase();

              location.reload();
            }}
          >
            RESET DATABASE
          </button>
        </div>

        {error && (
          <pre className="rounded-xl border border-red-500 p-4 text-red-500">
            {error}
          </pre>
        )}

        {TABLES.map((table) => (
          <section
            key={table}
            className="rounded-xl border border-card-border bg-card p-5"
          >
            <h2 className="mb-4 text-xl font-semibold">{table}</h2>

            <pre className="overflow-x-auto text-sm">
              {JSON.stringify(data[table] ?? [], null, 2)}
            </pre>
          </section>
        ))}
      </div>
    </main>
  );
}
