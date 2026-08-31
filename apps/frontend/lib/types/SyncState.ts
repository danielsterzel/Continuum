import { Library } from "./Library";
import { Media } from "./Media";
import { MediaProgress } from "./MediaProgress";
import { Note } from "./Note";

export type SyncState = {
  libraries: Library[];
  media: Media[];
  notes: Note[];
  mediaProgress: MediaProgress[];
};
