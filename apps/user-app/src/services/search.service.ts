import apiClient from './api';
import { API_ENDPOINTS } from '@/constants/api';

export interface SearchChunk {
  text: string;
  score: number;
  ordinal: number;
}

export interface SearchResult {
  document_id: string;
  title: string;
  score: number;
  chunks: SearchChunk[];
  metadata: Record<string, string>;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

export interface SearchQuery {
  q: string;
  limit?: number;
}

export const searchService = {
  async search(query: SearchQuery): Promise<SearchResponse> {
    const response = await apiClient.get<SearchResponse>(API_ENDPOINTS.SEARCH.QUERY, {
      params: query,
    });
    return response.data;
  },
};
