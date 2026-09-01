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
  filepath: string;
  fileSize: number;

  mediaType: string;
  duration: number | null;
  thumbnailUrl: string | null;
  rating: number | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  version: number;
  entityType: EntityType.Media;
};

