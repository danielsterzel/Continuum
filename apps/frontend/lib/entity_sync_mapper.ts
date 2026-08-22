import { Device } from "@/types/device";
import { Library } from "@/types/library";
import type { Note } from "@/types/note";
import {
  EntityType,
  SyncOperation,
  type SyncChange,
} from "@/types/sync_change";
import { v4 } from "uuid";
import { EntityUnionType } from "@/types/entity_union";
import { Media } from "@/types/media";
import { MediaProgress } from "@/types/media_progress";
import snakecaseKeys from "snakecase-keys";

type SyncAndEntity = {
  syncChange: SyncChange;
  entity: EntityUnionType;
};

function prepareDeviceAndSyncId() {
  const device = getDevice();
  const syncId = v4();

  return { deviceId: device.id, syncId: syncId };
}

export function getDevice() {
  const device = localStorage.getItem("device");
  if (!device) {
    throw new Error("Device not found");
  }
  return JSON.parse(device) as Device;
}

export function mapNoteToSyncChange(
  entity: Note,
  operation: SyncOperation,
): SyncAndEntity {
  const { deviceId, syncId } = prepareDeviceAndSyncId();

  let { id, version, entityType, ...originalPayload } = entity;

  const payload = snakecaseKeys(originalPayload);

  if (operation == SyncOperation.CREATE) {
    version = 0;
  }

  const syncChange = {
    id: syncId,
    deviceId: deviceId,
    entityType: entityType,
    entityId: id,
    operation: operation,
    baseVersion: version,
    payload: payload,
    createdAt: Date.now(),
  };

  entity.version = version + 1;
  return { syncChange, entity };
}

export function mapLibraryToSyncChange(
  entity: Library,
  operation: SyncOperation,
): SyncAndEntity {
  const { deviceId, syncId } = prepareDeviceAndSyncId();

  let { id, media, version, entityType, ...originalPayload } = entity;

  const payload = snakecaseKeys(originalPayload);

  if (operation === SyncOperation.CREATE) {
    version = 0;
  }

  const syncChange = {
    id: syncId,
    deviceId: deviceId,
    entityType: entityType,
    entityId: id,
    operation: operation,
    baseVersion: version,
    payload: payload,
    createdAt: Date.now(),
  };

  entity.version = version + 1;

  return { syncChange, entity };
}

export function mapMediaToSyncChange(
  entity: Media,
  operation: SyncOperation,
): SyncAndEntity {
  const { deviceId, syncId } = prepareDeviceAndSyncId();

  let { id, version, entityType, ...originalPayload } = entity;

  const payload = snakecaseKeys(originalPayload);

  if (operation === SyncOperation.CREATE) {
    version = 0;
  }
  const syncChange = {
    id: syncId,
    deviceId: deviceId,
    entityType: entityType,
    entityId: id,
    operation: operation,
    baseVersion: version,
    payload: payload,
    createdAt: Date.now(),
  };

  entity.version = version + 1;

  return { syncChange, entity };
}

export function mapMediaProgressToSyncChange(
  entity: MediaProgress,
  operation: SyncOperation,
): SyncAndEntity {
  const { deviceId, syncId } = prepareDeviceAndSyncId();

  let { id, version, entityType, ...originalPayload } = entity;
  const payload = snakecaseKeys(originalPayload);

  if (operation === SyncOperation.CREATE) {
    version = 0;
  }

  if (operation === SyncOperation.DELETE) {
    throw new Error(
      "Invalid operation - DELETE for MediaProgress is not defined",
    );
  }

  const syncChange = {
    id: syncId,
    deviceId: deviceId,
    entityType: entityType,
    entityId: id,
    operation: operation,
    baseVersion: version,
    payload: payload,
    createdAt: Date.now(),
  };

  entity.version = version + 1;

  return { syncChange, entity };
}
export function deviceToSyncChange(
  entity: EntityUnionType,
  operation: SyncOperation,
) {
  const { deviceId, syncId } = prepareDeviceAndSyncId();
  let { id, version, entityType, ...originalPayload } = entity;

  const payload = snakecaseKeys(originalPayload);

  if (operation === SyncOperation.CREATE) {
    version = 0;
  }
  const syncChange = {
    id: syncId,
    deviceId: deviceId,
    entityType: entityType,
    entityId: id,
    operation: operation,
    baseVersion: version,
    payload: payload,
    createdAt: Date.now(),
  };

  entity.version = version + 1;

  return { syncChange, entity };
}

export function mapEntityToSync(
  entity: EntityUnionType,
  operation: SyncOperation,
) {
  switch (entity.entityType) {
    case EntityType.Library:
      return mapLibraryToSyncChange(entity, operation);

    case EntityType.Media:
      return mapMediaToSyncChange(entity, operation);

    case EntityType.MediaProgress:
      return mapMediaProgressToSyncChange(entity, operation);

    case EntityType.Note:
      return mapNoteToSyncChange(entity, operation);
  }
}
