// Синхронизировано с services/gateway/internal/domain/models.go

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
    description?: string | null;
    author: Author;
    category: Category;
    publication_date: string; // ISO 8601 timestamp
    tags: Tag[];
    content?: string | null; // Markdown content
    created_at: string; // ISO 8601 timestamp
    updated_at: string; // ISO 8601 timestamp
}

// Request/Response types синхронизированы с services/gateway/internal/domain/documents.go

export interface CreateDocumentRequest {
    title: string;
    description?: string | null;
    authorId: string;
    categoryId: number;
    publicationDate: string; // ISO 8601 timestamp
    tagIds?: number[];
}

export interface UpdateDocumentRequest {
    title?: string;
    description?: string | null;
    authorId?: string;
    categoryId?: number;
    publicationDate?: string; // ISO 8601 timestamp
    tagIds?: number[];
}

export interface ListDocumentsQuery {
    page?: number;
    limit?: number;
    authorId?: string;
    categoryId?: number;
    tagId?: number;
    search?: string;
}

export interface ListDocumentsResponse {
    documents: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateDocumentResponse {
    document: Document;
}

export interface GetDocumentResponse {
    document: Document;
}

export interface UpdateDocumentResponse {
    document: Document;
}

