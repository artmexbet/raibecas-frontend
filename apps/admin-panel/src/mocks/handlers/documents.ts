import { mockApiCall } from '@/mocks';
import { MOCK_DOCUMENTS, createMockDocument, type Document } from '@/mocks';

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
    const updatedDocument: Document = {
      id: baseDocument.id,
      title: data.title ?? baseDocument.title,
      author: data.author ?? baseDocument.author,
      category: data.category ?? baseDocument.category,
      publicationDate: data.publicationDate ?? baseDocument.publicationDate,
      content: data.content ?? baseDocument.content,
      tags: data.tags ?? baseDocument.tags,
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

