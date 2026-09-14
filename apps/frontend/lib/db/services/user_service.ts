import { getDatabase } from "../database";
import { LocalUserRepository } from "../repositories/local_user.repository";



export async function deleteLocalUserAfterLogout(): Promise<boolean>
{
    const db = await getDatabase();
    const repository = new LocalUserRepository(db);

    try
    {
        await repository.delete();
        return true
    }
    catch
    {
        return false
    }
}
