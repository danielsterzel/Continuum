import { LibraryRead } from "../types/Library";
import { Media, MediaRead } from "../types/Media";

import { EntityType } from "../types/EntityType";


export function getAssetUrl(path?: string | null): string | undefined {
    if (!path) return undefined;
    return `${process.env.NEXT_PUBLIC_API_URL}/${path.replace(/^\/+/, "")}`;
}

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
    return {...data, deletedAt: null, expectedVersion: 1, entityType: EntityType.Media, filepath: ""};

}
