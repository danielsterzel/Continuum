import { EntityType } from "./EntityType";

export type MediaProgressRead = {
  id: string;
  mediaId: string;
  currentPosition: number | null;
  lastWatched: number;
  lastDeviceId: string | null;
};

export type MediaProgressWrite = {
  currentPosition: number | null;
  lastDeviceId: string | null;
};

export type MediaProgress = {
  id: string;
  mediaId: string;
  currentPosition: number | null;
  lastWatched: string;
  lastDeviceId: string | null;

  expectedVersion: number;
  entityType: EntityType.MediaProgress;
};
