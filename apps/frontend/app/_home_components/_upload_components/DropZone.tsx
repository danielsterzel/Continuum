"use client";

import { Upload, X, File } from "lucide-react";
import { useRef, useState } from "react";

export function DropZone() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    setFiles((prev) => [...prev, ...Array.from(newFiles)]);
  }

  function removeFiles(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <>
      <p className="mt-6">
        Select file or drag and drop to upload to your library
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}

        className={`mt-4 p-4 rounded-2xl border border-dashed 
            flex items-center justify-center
         transition-colors duration-200
        ${isDragging ? "text-primary border-primary" : "text-neutral-300 border-neutral-300"}
        flex flex-col items-center`}
      >
        <Upload className="w-16 h-16 " />
        <p className="hidden sm:block">
          Drag and drop files or click to upload them
        </p>
        <p className="sm:hidden">Tap to select files</p>
        <ul className="mt-6 flex flex-col gap-4">
          {files.map((item, idx) => (
            <li
              className="min-w-0 grid grid-cols-[1fr_auto] gap-2 text-neutral-600"
              key={idx}
            >
              <div className="flex items-center min-w-0">
                <File className="w-6 h-6 shrink-0" />{" "}
                <span className="truncate">{item.name}</span>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  removeFiles(idx);
                }}
                className="
                  flex items-center justify-center
                  w-6 h-6
                  bg-red-400 rounded-lg transition-colors duration-200 hover:bg-red-500"
              >
                <X className="shrink-0 text-white cursor-pointer" />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <input
        ref={inputRef}
        multiple
        type="file"
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
    </>
  );
}
