import apiClient from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type {
  CreateBookmarkRequest,
  CreateBookmarkResponse,
  ListBookmarksQuery,
  ListBookmarksResponse,
} from '@/types/bookmark';
import type { Document } from '@/types/document';

type BookmarkApiItem = ListBookmarksResponse['items'][number] & {
  quote_text?: string | null;
  context?: string | null;
  page_label?: string | null;
};

type ListBookmarksApiResponse = Omit<ListBookmarksResponse, 'items'> & {
  items: BookmarkApiItem[];
};

type CreateBookmarkApiResponse = {
  item: BookmarkApiItem;
};

function normalizeDocument(document: Document): Document {
  return {
    ...document,
    author: document.author ?? { id: '', name: 'Неизвестный автор' },
    category: document.category ?? { id: 0, title: 'Без категории' },
    tags: Array.isArray(document.tags) ? document.tags : [],
    description: document.description ?? null,
    content: document.content ?? null,
    cover_url: document.cover_url ?? null,
  };
}

function normalizeBookmark(item: BookmarkApiItem): ListBookmarksResponse['items'][number] {
  const document = normalizeDocument(item.document);

  if (item.kind === 'quote') {
    return {
      ...item,
      document,
      quote_text: item.quote_text?.trim() || 'Цитата временно недоступна',
      context: item.context ?? undefined,
      page_label: item.page_label ?? undefined,
    };
  }

  return {
    ...item,
    document,
  };
}

export const bookmarkService = {
  async getAll(query?: ListBookmarksQuery): Promise<ListBookmarksResponse> {
    const response = await apiClient.get<ListBookmarksApiResponse>(API_ENDPOINTS.BOOKMARKS.LIST, {
      params: query,
    });

    return {
      ...response.data,
      items: response.data.items.map(normalizeBookmark),
    };
  },

  async create(payload: CreateBookmarkRequest): Promise<CreateBookmarkResponse> {
    const response = await apiClient.post<CreateBookmarkApiResponse>(API_ENDPOINTS.BOOKMARKS.LIST, payload);

    return {
      item: normalizeBookmark(response.data.item),
    };
  },
};

