
export interface MediaRead{
    id: string;
    libraryId: string;
    filename: string;
    fileSize: number;
    mediaType: string;
    duration: number | null;
    thumbnailUrl: string | null; 
    rating: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface Media{};
