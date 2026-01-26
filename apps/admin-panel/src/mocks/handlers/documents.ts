import { mockApiCall } from '@/mocks';
import { MOCK_DOCUMENTS, createMockDocument, MOCK_AUTHORS, MOCK_CATEGORIES, MOCK_TAGS } from '@/mocks';
import type { Document } from '@/types/document';

/**
 * Моковые обработчики для документов
 */
export const documentsMockHandlers = {
  /**
   * Получить список документов
   */
  async getAll(): Promise<Document[]> {
    const result = await mockApiCall([...MOCK_DOCUMENTS]);
    return result.data;
  },

  /**
   * Получить документ по ID
   */
  async getById(id: string): Promise<Document> {
    const document = MOCK_DOCUMENTS.find(d => d.id === id);

    if (!document) {
      throw new Error('Document not found');
    }

    const result = await mockApiCall(document);
    return result.data;
  },

  /**
   * Создать новый документ
   */
  async create(data: Partial<Document>): Promise<Document> {
    const newDocument = createMockDocument(data);
    MOCK_DOCUMENTS.push(newDocument);

    const result = await mockApiCall(newDocument, 1000);
    return result.data;
  },

  /**
   * Обновить документ
   */
  async update(id: string, data: Partial<Document>): Promise<Document> {
    const index = MOCK_DOCUMENTS.findIndex(d => d.id === id);

    if (index === -1) {
      throw new Error('Document not found');
    }

    const baseDocument = MOCK_DOCUMENTS[index]!;

    // Обрабатываем автора - если пришла строка, ищем в моках или оставляем текущего
    let author = data.author ?? baseDocument.author;
    if (typeof (data.author as any) === 'string') {
      const foundAuthor = MOCK_AUTHORS.find(a => a.name === (data.author as any));
      author = foundAuthor ?? baseDocument.author;
    }

    // Обрабатываем категорию - если пришла строка, ищем в моках или оставляем текущую
    let category = data.category ?? baseDocument.category;
    if (typeof (data.category as any) === 'string') {
      const foundCategory = MOCK_CATEGORIES.find(c => c.title === (data.category as any));
      category = foundCategory ?? baseDocument.category;
    }

    // Обрабатываем теги - если пришёл массив строк, ищем соответствующие объекты
    let tags = data.tags ?? baseDocument.tags;
    if (Array.isArray(data.tags) && data.tags.length > 0 && typeof (data.tags[0] as any) === 'string') {
      tags = (data.tags as unknown as string[])
        .map(tagTitle => MOCK_TAGS.find(t => t.title === tagTitle))
        .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);

      // Если не нашли теги, оставляем текущие
      if (tags.length === 0) {
        tags = baseDocument.tags;
      }
    }

    const updatedDocument: Document = {
      id: baseDocument.id,
      title: data.title ?? baseDocument.title,
      description: data.description ?? baseDocument.description,
      author: author as any,
      category: category as any,
      publicationDate: data.publicationDate ?? baseDocument.publicationDate,
      content: data.content ?? baseDocument.content,
      tags: tags as any,
      views: data.views ?? baseDocument.views,
      notesCount: data.notesCount ?? baseDocument.notesCount,
      createdAt: baseDocument.createdAt,
      updatedAt: new Date().toISOString(),
    };

    MOCK_DOCUMENTS[index] = updatedDocument;

    const result = await mockApiCall(updatedDocument, 1000);
    return result.data;
  },

  /**
   * Удалить документ
   */
  async delete(id: string): Promise<void> {
    const index = MOCK_DOCUMENTS.findIndex(d => d.id === id);

    if (index === -1) {
      throw new Error('Document not found');
    }

    MOCK_DOCUMENTS.splice(index, 1);

    await mockApiCall(undefined, 800);
  },
};

