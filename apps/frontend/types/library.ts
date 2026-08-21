import { MediaRead } from "./media";


export type LibraryRead = {
    id: string;
    user_id?: string;
    name: string;
    description?: string;
    iconUrl: string;
    media?: MediaRead[];
    updatedAt?: string;
    size?: string;    
}

export type LibraryCreate = {
    name: string;
    description?: string;

}

export type LibrarySync = LibraryRead &  {
    deletedAt: number;
    createdAt: number;
    version: number;
}