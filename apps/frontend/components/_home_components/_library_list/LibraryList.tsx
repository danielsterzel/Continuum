"use client";
import { useEffect, useState } from "react";
import { LibraryListItem } from "./LibraryListItem";
import type { Library } from "@/types/library";

const userId = "76d06599-1154-4c60-b39e-6b9f6bba2046";

export function LibraryList() {
  const [items, setItems] = useState<Library[]>([]);

  useEffect(() => {
    async function fetchLibs() {
      try {
        const res = await fetch(
          `http://localhost:8000/library/collection/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const data = (await res.json()) as Library[];
        setItems(data);

        data.forEach(e => {
          console.log("ID:", e.id);
        })

      } catch (e) {}
    }

    fetchLibs();
  }, []);

  return (
    <div className="bg-card p-4 shadow-xl rounded-xl max-h-[500px] overflow-y-auto">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-2 py-1 text-neutral-400">
        <p className="pl-10 hidden sm:block">Name</p>
        <p className="hidden sm:block">Files</p>
        <p className="hidden sm:block">Last modified</p>
        <p className="hidden sm:block">Size</p>
      </div>

      <div >
        {/* later map with key using idx or better lib id */}
        {items.map((item, idx) => (
          <li key={item.id}>
            <LibraryListItem library={item} />
          </li>
        ))}
      </div>
    </div>
  );
}
