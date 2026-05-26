export interface NoteItem {
  id: string;
  title: string;
  content: string;
  document_id?: string | null;
  bookmark_id?: string | null;
  position_in_document?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListNotesQuery {
  page?: number;
  limit?: number;
  search?: string;
  document_id?: string;
  bookmark_id?: string;
}

export interface ListNotesResponse {
  items: NoteItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetNoteResponse {
  item: NoteItem;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  documentId?: string;
  bookmarkId?: string;
  positionInDocument?: string;
}

export interface CreateNoteResponse {
  item: NoteItem;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  documentId?: string;
  bookmarkId?: string;
  positionInDocument?: string;
  clearDocumentId?: boolean;
  clearBookmarkId?: boolean;
  clearPosition?: boolean;
}

export interface UpdateNoteResponse {
  item: NoteItem;
}
