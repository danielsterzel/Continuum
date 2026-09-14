"use client";

import { CircleAlert, X } from "lucide-react";

type ErrorLogoutToastProps = {
  onClose: () => void;
};

export function ErrorLogoutToast({ onClose }: ErrorLogoutToastProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 overflow-hidden rounded-2xl border border-red-200 bg-white p-4 pr-12 text-red-950 shadow-[0_18px_50px_-18px_rgba(127,29,29,0.45)] sm:right-6 sm:top-6"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
        <CircleAlert className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="font-semibold">Failed to logout</p>
        <p className="mt-0.5 text-sm leading-5 text-red-700">
          Your local session could not be removed. Please try again.
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="absolute right-3 top-3 rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="absolute inset-x-0 bottom-0 h-1 bg-red-500" />
    </div>
  );
}
