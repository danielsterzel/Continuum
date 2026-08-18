"use client";

import { Edit } from "lucide-react"
import { RefObject, useState } from "react";
import { NoteModal } from "./NoteModal";
import { createPortal } from "react-dom";

function handleNoteAdd(videoRef: RefObject<HTMLVideoElement | null> | undefined)

{   
    if(!videoRef)
    {return;}
    if (!videoRef.current) {
      return;
    }
  
    const timestamp = videoRef.current.currentTime;
}

type CreatNoteProps = {
    videoRef? : RefObject<HTMLVideoElement | null>;  
}
export function CreateNote({videoRef}: CreatNoteProps)
{

    const [show, setShow] = useState(false);

    return (
        <>
    <button
        type="button"
        onClick={() => {
            handleNoteAdd(videoRef);
            setShow(true);
        }}
        className="
        mb-4 inline-flex items-center gap-2
        px-12 py-2 rounded-2xl
        bg-primary text-emerald-950 text-sm font-medium
        shadow-lg shadow-primary/20
        hover:bg-primary-hover hover:shadow-xl 
        active:scale-[0.98]
        transition-all duration-200
        cursor-pointer"
      >
        <Edit className="w-4 h-4 transition-transform duration-200 " />
        <span>New Note</span>
      </button>
      {createPortal(<NoteModal onClose={() => setShow(false)} show={show}/>, document.body)}
      </>)}