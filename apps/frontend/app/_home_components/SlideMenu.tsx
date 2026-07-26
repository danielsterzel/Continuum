"use client";

import { useState } from "react";

export function SlideMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-40 w-10 h-10 flex items-center justify-center rounded-lg shadow-md"
        style={{ backgroundColor: "var(--color-primary)" }}
        aria-label="Otwórz menu"
      >
        <span className="text-white text-xl">☰</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <p className="text-xl font-semibold">Menu</p>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-800 text-xl"
            aria-label="Zamknij menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          <a href="#" className="p-2 rounded hover:bg-gray-100">Dashboard</a>
          <a href="#" className="p-2 rounded hover:bg-gray-100">Ustawienia</a>
          <a href="#" className="p-2 rounded hover:bg-gray-100">Profil</a>
          <a href="#" className="p-2 rounded hover:bg-gray-100">Wyloguj</a>
        </nav>
      </div>
    </>
  );
}