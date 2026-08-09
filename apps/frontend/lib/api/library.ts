import { Library } from "@/types/library";
import { MediaRead } from "@/types/media";
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

export async function fetchSingleLib(userId: string, libraryId: string): Promise<Library>
{
    const res = await fetch(`${API_PREFIX}/collection/${userId}/${libraryId}`, {
        method: "GET"
    });
    if(!res.ok)
        {
            throw new Error(`HTTP error: ${res.status}`);
        }

    const data = await res.json() as Library;
    return data;
}

async function postMediaFiles(libraryId: string, formData: FormData)
{
    const res = await fetch(`${API_PREFIX}/${libraryId}/media/upload`, {
        method: "POST",
        body: formData
    });

    if(!res.ok)
        {
            throw new Error(`HTTP error: ${res.status}`)
        }

    const returnData = await res.json();
    return returnData;
}

export async function uploadMedia(libraryId: string, files: File[]): Promise<MediaRead[]>
{
    const formData = new FormData();

    files.forEach((file) => {
        formData.append("files", file);
    })
    const returnedFiles = await postMediaFiles(libraryId, formData);

    return returnedFiles
}