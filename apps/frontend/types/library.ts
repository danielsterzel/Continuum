import { MediaRead } from "./media";
import { EntityType } from "./sync_change";


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

export type Library = LibraryRead &  {
    deletedAt: number;
    createdAt: number;
    version: number;
    entityType: EntityType.Library
}