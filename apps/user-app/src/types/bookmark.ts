import type { Document } from './document';

export type BookmarkKind = 'publication' | 'quote';

export interface BookmarkBase {
  id: string;
  kind: BookmarkKind;
  saved_at: string;
  document: Document;
}

export interface PublicationBookmark extends BookmarkBase {
  kind: 'publication';
}

export interface QuoteBookmark extends BookmarkBase {
  kind: 'quote';
  quote_text: string;
  context?: string;
  page_label?: string;
}

export type BookmarkItem = PublicationBookmark | QuoteBookmark;

export interface ListBookmarksQuery {
  page?: number;
  limit?: number;
  search?: string;
  kind?: BookmarkKind;
}

export interface ListBookmarksResponse {
  items: BookmarkItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateBookmarkRequest {
  documentId: string;
  kind: BookmarkKind;
  quoteText?: string;
  context?: string;
  pageLabel?: string;
}

export interface CreateBookmarkResponse {
  item: BookmarkItem;
}

