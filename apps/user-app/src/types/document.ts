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
  publication_date: string;
  tags: Tag[];
  content?: string | null;
  created_at: string;
  updated_at: string;
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

export interface GetDocumentResponse {
  document: Document;
}

