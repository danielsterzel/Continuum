
import type { Note } from "@/types/note";
import type { Library } from "@/types/library";
import type { Media } from "@/types/media";
import type { MediaProgress } from "@/types/media_progress";
import type { Device } from "@/types/device";

export type EntityUnionType = Note | Library | Media | MediaProgress | Device;
