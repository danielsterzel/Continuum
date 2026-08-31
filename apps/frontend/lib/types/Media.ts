import { EntityType } from "./EntityType";

export type MediaRead = {
  id: string;
  libraryId: string;
  filename: string;
  fileSize: number;
  mediaType: string;
  duration: number | null;
  thumbnailUrl: string | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Media = {
  id: string;
  libraryId: string;

  filename: string;
  fileSize: number;

  mediaType: string;
  duration: number | null;
  thumbnailUrl: string | null;
  rating: number | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: number;

  version: number;
  entityType: EntityType.Media;
  filepath: string;
};
export type MediaType = "video" | "audio" | "image" | "document";
