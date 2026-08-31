import { Library, LibraryCreate, LibraryRead } from "../types/Library";
import { Media, MediaRead } from "../types/Media";

import { v4 } from "uuid";
import { saveLocalFile } from "../files/LocalFileStorage";
import { EntityType } from "../types/EntityType";


const API_ORIGIN = "http://127.0.0.1:8000";
const API_PREFIX = `${API_ORIGIN}/library`;



export function getAssetUrl(path?: string | null): string | undefined {
    if (!path) return undefined;
    return `${process.env.NEXT_PUBLIC_API_URL}/${path.replace(/^\/+/, "")}`;
}


// export async function fetchLibraries()
// {
//     const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/library/collection`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//             },
//           },
//         );
//     return res;
// }


// export async function deleteLibrary(libraryId: string)
// {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/library/collection/${libraryId}`, {
//         method: "DELETE"   
//     });

//     if(!res.ok)
//         {
//             console.log(res.statusText)
//             throw new Error(`HTTP error ${res.status}`);
//         }
// }

export async function fetchSingleLibByWeb(libraryId: string): Promise<LibraryRead>
{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/library/collection/${libraryId}`, {
        method: "GET"
    });
    if(!res.ok)
        {
            throw new Error(`HTTP error: ${res.status}`);
        }

    const data = await res.json() as LibraryRead;
    return data;
}

async function postMediaFiles(libraryId: string, formData: FormData)
{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/library/${libraryId}/media/upload`, {
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

export async function fetchSingleMedia(libraryId: string, mediaId: string): Promise<Media>
{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/library/${libraryId}/media/${mediaId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })

    if(!res.ok)
        {
            throw new Error(`HTTP error: ${res.status}`)
        }

    const data = await res.json();
    return {...data, deletedAt: null, version: 1, entityType: EntityType.Media, filepath: ""};

}

export async function deleteMediaFromLibrary(libraryId: string, mediaId: string)
{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/library/collection/delete_media/${libraryId}/${mediaId}`, {
        method: "DELETE"
    });
    if(!res.ok )
        {
            throw new Error(`HTTP error when deleting: ${res.status}`); 
        }
    
}
