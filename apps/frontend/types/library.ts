

export interface Library {
    id: number;
    user_id?: string;
    name: string;
    description?: string;
    iconUrl: string;
    media?: string; // later on Media[]
    updatedAt?: string;
    size?: string;    
}

export type LibraryCreate = {
    user_id: string;
    name: string;
    description?: string;
    icon_url?: string;
    
}
