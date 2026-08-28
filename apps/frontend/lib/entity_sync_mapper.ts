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

export function mapNoteToSyncChange(
  entity: Note,
  operation: SyncOperation,
  deviceId: string,
): SyncAndEntity {
  const syncId = v4();

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
    expectedVersion: version,
    payload: payload,
    createdAt: new Date().toISOString(),
  };

  entity.version = version + 1;
  return { syncChange, entity };
}

export function mapLibraryToSyncChange(
  entity: Library,
  operation: SyncOperation,
  deviceId: string,
): SyncAndEntity {
  const syncId = v4();
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
    expectedVersion: version,
    payload: payload,
    createdAt: new Date().toISOString(),
  };

  entity.version = version + 1;

  return { syncChange, entity };
}

export function mapMediaToSyncChange(
  entity: Media,
  operation: SyncOperation,
  deviceId: string,
): SyncAndEntity {
  const syncId = v4();
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
    expectedVersion: version,
    payload: payload,
    createdAt: new Date().toISOString(),
  };

  entity.version = version + 1;

  return { syncChange, entity };
}

export function mapMediaProgressToSyncChange(
  entity: MediaProgress,
  operation: SyncOperation,
  deviceId: string,
): SyncAndEntity {
  const syncId = v4();
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
    expectedVersion: version,
    payload: payload,
    createdAt: new Date().toISOString(),
  };

  entity.version = version + 1;

  return { syncChange, entity };
}

export function deviceToSyncChange(
  entity: EntityUnionType,
  operation: SyncOperation,
) {
  const syncId = v4();
  let { id, version, entityType, ...originalPayload } = entity;

  const payload = snakecaseKeys(originalPayload);

  if (operation === SyncOperation.CREATE) {
    version = 0;
  }
  const syncChange = {
    id: syncId,
    deviceId: id,
    entityType: entityType,
    entityId: id,
    operation: operation,
    expectedVersion: version,
    payload: payload,
    createdAt: new Date().toISOString(),
  };

  entity.version = version + 1;

  return { syncChange, entity };
}

export function mapEntityToSync(
  entity: EntityUnionType,
  operation: SyncOperation,
  deviceId?: string,
) {
  if (entity.entityType === EntityType.Device) {
    return deviceToSyncChange(entity, operation);
  }

  if (!deviceId) {
    throw new Error("deviceId is required for synced entity");
  }
  switch (entity.entityType) {
    case EntityType.Library:
      return mapLibraryToSyncChange(entity, operation, deviceId);

    case EntityType.Media:
      return mapMediaToSyncChange(entity, operation, deviceId);

    case EntityType.MediaProgress:
      return mapMediaProgressToSyncChange(entity, operation, deviceId);

    case EntityType.Note:
      return mapNoteToSyncChange(entity, operation, deviceId);
  }
}
