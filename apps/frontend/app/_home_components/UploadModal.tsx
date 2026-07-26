"use client";

import { X } from "lucide-react";
import { DropZone } from "./_upload_components/DropZone";
type UploadModalProps = {
  show: boolean;
  onClose: () => void;
};

export function UploadModal({ show, onClose }: Readonly<UploadModalProps>) {


  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
      onClick={() => onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-2 items-center text-center 
        relative w-full max-w-lg 
        rounded-2xl shadow-2xl bg-white px-4 pt-6 pb-12"
      >
        <X
          className="
            absolute sm:right-2 sm:top-2 right-1 top-1
            w-8 h-8 
            border border-neutral-500 rounded-lg
            cursor-pointer transition-colors text-neutral-500 hover:text-neutral-800
            hover:border-neutral-800
            duration-200
            "
          onClick={() => onClose()}
        />
        <DropZone />
        
      </div>
    </div>
  );
}
