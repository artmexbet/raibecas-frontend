import apiClient from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type {
  CreateNoteRequest,
  CreateNoteResponse,
  GetNoteResponse,
  ListNotesQuery,
  ListNotesResponse,
  NoteItem,
  UpdateNoteRequest,
  UpdateNoteResponse,
} from '@/types/note';

function normalizeNote(item: NoteItem): NoteItem {
  return {
    ...item,
    document_id: item.document_id ?? null,
    bookmark_id: item.bookmark_id ?? null,
    position_in_document: item.position_in_document ?? null,
  };
}

export const noteService = {
  async getAll(query?: ListNotesQuery): Promise<ListNotesResponse> {
    const response = await apiClient.get<ListNotesResponse>(API_ENDPOINTS.NOTES.LIST, {
      params: query,
    });

    return {
      ...response.data,
      items: response.data.items.map(normalizeNote),
    };
  },

  async getById(id: string): Promise<GetNoteResponse> {
    const response = await apiClient.get<GetNoteResponse>(API_ENDPOINTS.NOTES.BY_ID(id));

    return {
      item: normalizeNote(response.data.item),
    };
  },

  async create(payload: CreateNoteRequest): Promise<CreateNoteResponse> {
    const response = await apiClient.post<CreateNoteResponse>(API_ENDPOINTS.NOTES.LIST, payload);

    return {
      item: normalizeNote(response.data.item),
    };
  },

  async update(id: string, payload: UpdateNoteRequest): Promise<UpdateNoteResponse> {
    const response = await apiClient.put<UpdateNoteResponse>(API_ENDPOINTS.NOTES.BY_ID(id), payload);

    return {
      item: normalizeNote(response.data.item),
    };
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.NOTES.BY_ID(id));
  },
};
