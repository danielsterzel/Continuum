
import type { Note } from "./Note";
import type { Library } from "./Library";
import type { Media } from "./Media";
import type { MediaProgress } from "./MediaProgress";
import type { Device } from "./Device";

export type EntityUnionType = Note | Library | Media | MediaProgress | Device;
