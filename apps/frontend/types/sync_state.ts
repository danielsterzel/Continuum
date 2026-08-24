import { Library } from "./library";
import { Media } from "./media";
import { MediaProgress } from "./media_progress";
import { Note } from "./note";


export type SyncState = {
    libraries: Library[];
    media: Media[];
    notes: Note[];
    mediaProgress: MediaProgress[];

};