import { MediaRead } from "./media";


export interface Library {
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
    user_id: string;
    name: string;
    description?: string;
    
}
