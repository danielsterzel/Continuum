import { EntityType } from "./EntityType";

export type DeviceRead = {
  id: string;
  userId: string;
  name: string | null;
  lastSeen: string;
  updatedAt: string;
  deletedAt: string | null;
  expectedVersion: number;
};

export type DeviceWrite = {
  name: string | null;
};

export type Device = {
  id: string;
  userId: string;
  name: string | null;
  lastSeen: string;
  updatedAt: string;
  deletedAt: string | null;
  expectedVersion: number;
  entityType: EntityType.Device;
};
