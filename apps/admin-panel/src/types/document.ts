// Синхронизировано с services/gateway/internal/domain/models.go

export interface Author {
    id: string;
    name: string;
}

export interface AuthorshipType {
    id: number;
    title: string;
}

export interface Category {
    id: number;
    title: string;
}

export interface DocumentType {
    id: number;
    name: string;
}

export interface Tag {
    id: number;
    title: string;
}

export interface DocumentParticipant {
    author: Author;
    authorshipType: AuthorshipType;
}

export interface DocumentParticipantRef {
    authorId: string;
    typeId: number;
}

export interface Document {
    id: string;
    title: string;
    description?: string | null;
    author: Author;
    category: Category;
    documentType?: DocumentType | null;
    participants: DocumentParticipant[];
    publication_date: string; // ISO 8601 timestamp
    tags: Tag[];
    content?: string | null; // Editor.js JSON (serialized OutputData). Backend converts to Markdown on save.
    cover_url?: string | null; // Presigned URL for cover image (24h TTL)
    created_at: string; // ISO 8601 timestamp
    updated_at: string; // ISO 8601 timestamp
}

// Request/Response types синхронизированы с services/gateway/internal/domain/documents.go

// Тип для создания нового документа
export interface CreateDocumentRequest {
    title: string;
    description?: string | null;
    categoryId?: number;
    documentTypeId: number;
    participants: DocumentParticipantRef[];
    publicationDate: string; // ISO 8601 timestamp
    tagIds?: number[];
    content?: string; // Editor.js JSON (serialized OutputData)
}

export interface UpdateDocumentRequest {
    title?: string;
    description?: string | null;
    categoryId?: number;
    documentTypeId?: number;
    participants?: DocumentParticipantRef[];
    publicationDate?: string; // ISO 8601 timestamp
    tagIds?: number[];
    content?: string;
}

export interface ListDocumentsQuery {
    page?: number;
    limit?: number;
    authorId?: string;
    categoryId?: number;
    documentTypeId?: number;
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

