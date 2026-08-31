import { EntityType } from "./EntityType";
import { SyncOperation } from "./SyncOperation";

export type SyncChange = {
  id: string;
  deviceId: string;

  entityType: EntityType;
  entityId: string;
  operation: SyncOperation;
  expectedVersion: number;
  payload: Record<string, any>;
  createdAt: string;
};

export type SyncChangeWrite = {
  deviceId: string;
  entityType: string;
  entityId: string;
  operation: string;
  expectedVersion: number;
  payload: Record<string, any>;
};

export type SyncChangeRead = SyncChangeWrite & {
  id: string;
  createdAt: number;
};
