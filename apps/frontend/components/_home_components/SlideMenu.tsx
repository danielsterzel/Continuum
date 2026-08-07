"use client";

import { useState } from "react";

export function SlideMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer fixed top-6 right-6 z-40 w-10 h-10 flex items-center justify-center rounded-xl shadow-md bg-primary hover:bg-primary-hover transition-colors duration-200"
        aria-label="Open menu"
      >
        <span className="text-white text-xl leading-none">☰</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-72 bg-card border-l border-card-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-card-border">
          <p className="text-lg font-semibold text-text-primary">Menu</p>
          <button
            onClick={() => setIsOpen(false)}
            className="text-text-tertiary hover:text-text-primary transition-colors duration-200 text-xl"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          <a href="#" className="px-3 py-2.5 rounded-lg text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors duration-200">Dashboard</a>
          <a href="#" className="px-3 py-2.5 rounded-lg text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors duration-200">Settings</a>
          <a href="#" className="px-3 py-2.5 rounded-lg text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors duration-200">Profile</a>
          <a href="#" className="px-3 py-2.5 rounded-lg text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors duration-200">Sign out</a>
        </nav>
      </div>
    </>
  );
}
