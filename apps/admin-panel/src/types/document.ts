export interface Document {
    id: string;
    title: string;
    description?: string;
    content: string;
    author: string;
    category: string;
    publicationDate: string;
    tags: string[];
    views: number;
    notesCount: number;
    createdAt: string;
    updatedAt: string;
}