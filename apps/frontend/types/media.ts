
export interface Media {
    id: number;
    library_id: number;
    name: string;
    type: string;
    fileSize: number;
    duration?: number;
    mimeType?: string;
    url?: string;
    createdAt?: string;
    updatedAt?: string;
}
