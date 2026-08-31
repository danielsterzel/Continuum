"use client";

import { useDevice } from "@/app/context/DeviceContext";
import { useUser } from "@/app/context/UserContext";
import { deleteLibrary } from "@/lib/db/services/library_service";
import { getLibrary } from "@/lib/db/services/library_service";
import { TriangleAlert, Trash2, X} from "lucide-react";
import { createPortal } from "react-dom";

type LibraryDeleteModalProps = {
  show: boolean;
  libraryId: string;
  onClose: () => void;
  onDeleted: () => void;
};

export function LibraryDeleteModal({
  show,
  libraryId,
  onClose,
  onDeleted,
}: Readonly<LibraryDeleteModalProps>) 
{

  const {user} = useUser();
  const {device} = useDevice();

  async function handleDelete() {

    const lib = await getLibrary(user!.id, libraryId);
    console.log("LIB", lib?.id);
    if(lib)
      {
        await deleteLibrary(lib, device!.id);
      }

    onDeleted();
    onClose();
  }
  if (!show) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl border border-card-border animate-fade-in-up"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-card-hover transition-colors duration-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>


        <div className="flex flex-col items-center pt-10 pb-6 px-8">
          <div className="relative mb-6">

            <div className="absolute inset-0 rounded-full bg-red-100 scale-150 opacity-40" />

            <div className="absolute inset-0 rounded-full bg-red-100 scale-125 opacity-60" />

            <div className="relative w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
              <TriangleAlert
                className="w-9 h-9 text-red-500"
                strokeWidth={1.5}
              />
            </div>
          </div>


          <h2 className="text-xl font-semibold text-text-primary mb-2 text-center">
            Delete Library?
          </h2>
          <p className="text-text-secondary text-sm text-center leading-relaxed">
            This action is permanent and cannot be undone. All media inside this
            library will be removed.
          </p>
        </div>


        <div className="h-px w-full bg-card-border" />


        <div className="flex gap-3 p-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-card-border text-text-secondary text-sm font-medium bg-card hover:bg-card-hover transition-colors duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
          onClick={handleDelete}
          className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-medium transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
