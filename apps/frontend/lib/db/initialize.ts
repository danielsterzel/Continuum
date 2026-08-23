

import { getDatabase } from "./database";
import { DeviceRepository } from "./repositories/device_repository";
import { LibraryRepository } from "./repositories/library_repository";
import { MediaProgressRepository } from "./repositories/media_progress_repository";
import { MediaRepository } from "./repositories/media_repository";
import { NoteRepository } from "./repositories/note_repository";
import { SyncQueueRepository } from "./repositories/sync_queue_repository";
import { UserRepository } from "./repositories/user_repository";



export async function initializeDatabase(): Promise<void> 
{

    const db = await getDatabase();


  const userRepository = new UserRepository(db);
  const deviceRepository = new DeviceRepository(db);
  const libraryRepository = new LibraryRepository(db);
  const mediaRepository = new MediaRepository(db);
  const mediaProgressRepository = new MediaProgressRepository(db);
  const noteRepository = new NoteRepository(db);
  const syncQueueRepository = new SyncQueueRepository(db);
  
  

  await userRepository.initTable();
  await deviceRepository.initTable();
  await libraryRepository.initTable();
  await mediaRepository.initTable();
  await mediaProgressRepository.initTable();
  await noteRepository.initTable();
  await syncQueueRepository.initTable();


}