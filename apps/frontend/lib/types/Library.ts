import { MediaRead } from "./Media";
import { EntityType } from "./EntityType";

export type LibraryRead = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  iconUrl: string;
  media?: MediaRead[];
  updatedAt?: string;
  size?: string;
};

export type LibraryCreate = {
  name: string;
  description?: string;
};

export type Library = {
  id: string;
  userId: string;

  name: string;
  description?: string;

  iconUrl: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  version: number;
  entityType: EntityType.Library;
};
