import { getDatabase } from "../database";
import { UserRepository } from "../repositories/user_repository";



export async function deleteLocalUserAfterLogout(id: string): Promise<boolean>
{
    const db = await getDatabase();
    const repository = new UserRepository(db);

    try
    {
        await repository.deleteById(id);
        return true
    }
    catch
    {
        return false
    }
}