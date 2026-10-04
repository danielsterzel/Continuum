import { EntityType } from "./EntityType";
import { SyncOperation } from "./SyncOperation";

export type SyncChange = {
  id: string;
  deviceId: string;

  entityType: EntityType;
  entityId: string;
  operation: SyncOperation;
  version: number;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type SyncChangeWrite = {
  id: string;
  deviceId: string;
  entityType: string;
  entityId: string;
  operation: string;
  version: number;
  payload: Record<string, unknown>;
};

export type SyncChangeRead = SyncChangeWrite & {
  createdAt: string;
};
