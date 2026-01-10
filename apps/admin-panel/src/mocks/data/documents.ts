/**
 * Типы для документов
 */

export interface Document {
  id: string;
  title: string;
  author: string;
  category: string;
  publicationDate: string;
  content: string; // Markdown содержимое
  tags: string[];
  views: number;
  notesCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Моковые данные документов
 */
export const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'Критика чистого разума',
    author: 'Иммануил Кант',
    category: 'Эпистемология',
    publicationDate: '1781-01-01',
    content: '# Критика чистого разума\n\n## Введение\n\nЭто моковый контент документа...',
    tags: ['философия', 'эпистемология', 'кант', 'метафизика'],
    views: 1523,
    notesCount: 47,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Бытие и время',
    author: 'Мартин Хайдеггер',
    category: 'Онтология',
    publicationDate: '1927-01-01',
    content: '# Бытие и время\n\n## О смысле бытия\n\nМоковое содержание...',
    tags: ['философия', 'онтология', 'хайдеггер', 'экзистенциализм'],
    views: 892,
    notesCount: 31,
    createdAt: '2024-02-20T14:30:00.000Z',
    updatedAt: '2024-03-10T09:15:00.000Z',
  },
  {
    id: '3',
    title: 'Феноменология духа',
    author: 'Георг Вильгельм Фридрих Гегель',
    category: 'Феноменология',
    publicationDate: '1807-01-01',
    content: '# Феноменология духа\n\n## Предисловие\n\nМоковый текст работы...',
    tags: ['философия', 'феноменология', 'гегель', 'диалектика'],
    views: 654,
    notesCount: 22,
    createdAt: '2024-03-05T11:20:00.000Z',
    updatedAt: '2024-03-05T11:20:00.000Z',
  },
];

/**
 * Создает новый моковый документ
 */
export function createMockDocument(data: Partial<Document>): Document {
  const now = new Date().toISOString();
  return {
    id: String(MOCK_DOCUMENTS.length + 1),
    title: data.title || 'Новый документ',
    author: data.author || 'Неизвестный автор',
    category: data.category || 'Разное',
    publicationDate: data.publicationDate || new Date().toISOString().split('T')[0] || '2024-01-01',
    content: data.content || '# Новый документ\n\nСодержимое...',
    tags: data.tags || [],
    views: 0,
    notesCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

