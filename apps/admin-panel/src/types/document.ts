export interface Author {
    id: string;
    name: string;
}

export interface Category {
    id: number;
    title: string;
}

export interface Tag {
    id: number;
    title: string;
}

export interface Document {
    id: string;
    title: string;
    description?: string;
    author: Author;
    category: Category;
    publicationDate: string;
    tags: Tag[];
    content?: string;
    views?: number;
    notesCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDocumentRequest {
    title: string;
    description?: string;
    authorId: string;
    categoryId: number;
    publicationDate: string;
    tagIds?: number[];
}

export interface UpdateDocumentRequest {
    title?: string;
    description?: string;
    authorId?: string;
    categoryId?: number;
    publicationDate?: string;
    tagIds?: number[];
}

export interface ListDocumentsResponse {
    documents: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
