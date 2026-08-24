import { Library } from "@/types/library";
import { getDatabase } from "../db/database";
import { LibraryRepository } from "../db/repositories/library_repository";

export async function getLibraries(userId: string): Promise<Library[]> {
  const db = await getDatabase();
  const libraryRepository = new LibraryRepository(db);

  return await libraryRepository.getAllForUser(userId);
}
