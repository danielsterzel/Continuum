import { EntityType } from "./EntityType";

export type DeviceRead = {
  id: string;
  userId: string;
  name: string | null;
  lastSeen: number;
};

export type DeviceWrite = {
  name: string | null;
};

export type Device = {
  id: string;
  userId: string;
  name: string | null;
  lastSeen: string;
  deletedAt: string | null;
  version: number;
  entityType: EntityType.Device;
};
