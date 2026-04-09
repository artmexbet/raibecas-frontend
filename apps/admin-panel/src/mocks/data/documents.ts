import type {Author, AuthorshipType, Category, Document, DocumentType, Tag} from '@/types/document.ts';

/**
 * Моковые авторы
 */
export const MOCK_AUTHORS: Author[] = [
    {id: '550e8400-e29b-41d4-a716-446655440001', name: 'Иммануил Кант'},
    {id: '550e8400-e29b-41d4-a716-446655440002', name: 'Мартин Хайдеггер'},
    {id: '550e8400-e29b-41d4-a716-446655440003', name: 'Георг Вильгельм Фридрих Гегель'},
];

/**
 * Моковые категории
 */
export const MOCK_CATEGORIES: Category[] = [
    {id: 1, title: 'Эпистемология'},
    {id: 2, title: 'Онтология'},
    {id: 3, title: 'Феноменология'},
    {id: 4, title: 'Этика'},
    {id: 5, title: 'Метафизика'},
];

/**
 * Моковые теги
 */
export const MOCK_TAGS: Tag[] = [
    {id: 1, title: 'философия'},
    {id: 2, title: 'эпистемология'},
    {id: 3, title: 'кант'},
    {id: 4, title: 'метафизика'},
    {id: 5, title: 'онтология'},
    {id: 6, title: 'хайдеггер'},
    {id: 7, title: 'экзистенциализм'},
    {id: 8, title: 'феноменология'},
    {id: 9, title: 'гегель'},
    {id: 10, title: 'диалектика'},
];

export const MOCK_AUTHORSHIP_TYPES: AuthorshipType[] = [
    {id: 1, title: 'автор'},
    {id: 2, title: 'редактор'},
    {id: 3, title: 'рецензент'},
];

export const MOCK_DOCUMENT_TYPES: DocumentType[] = [
    {id: 1, name: 'Статья'},
    {id: 2, name: 'Монография'},
    {id: 3, name: 'Сборник'},
];

/**
 * Моковые данные документов
 * Синхронизировано с services/gateway/internal/domain/models.go
 */
export const MOCK_DOCUMENTS: Document[] = [
    {
        id: '550e8400-e29b-41d4-a716-446655440101',
        title: 'Критика чистого разума',
        description: 'Важнейший труд Иммануила Канта по теории познания',
        author: MOCK_AUTHORS[0]!,
        category: MOCK_CATEGORIES[0]!,
        documentType: MOCK_DOCUMENT_TYPES[1]!,
        participants: [{author: MOCK_AUTHORS[0]!, authorshipType: MOCK_AUTHORSHIP_TYPES[0]!}],
        publication_date: '1781-01-01T00:00:00Z',
        tags: [MOCK_TAGS[0]!, MOCK_TAGS[1]!, MOCK_TAGS[2]!, MOCK_TAGS[3]!],
        content: '# Критика чистого разума\n\nОсновополагающий философский труд по теории познания...',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440102',
        title: 'Бытие и время',
        description: 'Фундаментальная работа Мартина Хайдеггера по онтологии',
        author: MOCK_AUTHORS[1]!,
        category: MOCK_CATEGORIES[1]!,
        documentType: MOCK_DOCUMENT_TYPES[0]!,
        participants: [{author: MOCK_AUTHORS[1]!, authorshipType: MOCK_AUTHORSHIP_TYPES[0]!}],
        publication_date: '1927-01-01T00:00:00Z',
        tags: [MOCK_TAGS[0]!, MOCK_TAGS[4]!, MOCK_TAGS[5]!, MOCK_TAGS[6]!],
        content: '# Бытие и время\n\nФундаментальная онтология Dasein...',
        created_at: '2024-02-20T14:30:00Z',
        updated_at: '2024-03-10T09:15:00Z',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440103',
        title: 'Феноменология духа',
        description: 'Классическое произведение Гегеля по феноменологии и диалектике',
        author: MOCK_AUTHORS[2]!,
        category: MOCK_CATEGORIES[2]!,
        documentType: MOCK_DOCUMENT_TYPES[2]!,
        participants: [{author: MOCK_AUTHORS[2]!, authorshipType: MOCK_AUTHORSHIP_TYPES[0]!}],
        publication_date: '1807-01-01T00:00:00Z',
        tags: [MOCK_TAGS[0]!, MOCK_TAGS[7]!, MOCK_TAGS[8]!, MOCK_TAGS[9]!],
        content: '# Феноменология духа\n\nДиалектическое развитие сознания...',
        created_at: '2024-03-05T11:20:00Z',
        updated_at: '2024-03-05T11:20:00Z',
    },
];

/**
 * Создает новый моковый документ
 */
export function createMockDocument(data: Partial<Document>): Document {
    const now = new Date().toISOString();
    return {
        id: `550e8400-e29b-41d4-a716-4466554401${String(MOCK_DOCUMENTS.length + 1).padStart(2, '0')}`,
        title: data.title || 'Новый документ',
        description: data.description,
        author: data.author || MOCK_AUTHORS[0]!,
        category: data.category || MOCK_CATEGORIES[0]!,
        documentType: data.documentType || MOCK_DOCUMENT_TYPES[0]!,
        participants: data.participants || [{author: data.author || MOCK_AUTHORS[0]!, authorshipType: MOCK_AUTHORSHIP_TYPES[0]!}],
        publication_date: data.publication_date || new Date().toISOString(),
        tags: data.tags || [],
        content: data.content || '# Новый документ\n\nСодержание документа...',
        created_at: now,
        updated_at: now,
    };
}

