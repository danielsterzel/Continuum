

const API_PREFIX = "http://127.0.0.1:8000/library";

<<<<<<< Updated upstream
export async function deleteLibrary(userId: string, libraryId: string)
=======


export function getAssetUrl(path?: string | null): string | undefined {
    if (!path) return undefined;
    return `${process.env.NEXT_PUBLIC_API_URL}/${path.replace(/^\/+/, "")}`;
}


export async function fetchLibraries()
{
    const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/library/collection`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
    return res;
}

export async function createLibrary(bodyArg: LibraryCreate, icon: File | null)
>>>>>>> Stashed changes
{
    const res = await fetch(`${API_PREFIX}/collection/${userId}/${libraryId}`, {
        method: "DELETE"
    });

    if(!res.ok)
        {
            throw new Error(`HTTP error ${res.status}`);
        }
    
}