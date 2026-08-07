

const API_PREFIX = "http://127.0.0.1:8000/library";

export async function deleteLibrary(userId: string, libraryId: string)
{
    const res = await fetch(`${API_PREFIX}/collection/${userId}/${libraryId}`, {
        method: "DELETE"
    });

    if(!res.ok)
        {
            throw new Error(`HTTP error ${res.status}`);
        }
    
}