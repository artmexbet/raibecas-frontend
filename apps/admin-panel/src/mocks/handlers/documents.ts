import { mockApiCall } from '@/mocks';
import { MOCK_DOCUMENTS, createMockDocument, MOCK_AUTHORS, MOCK_AUTHORSHIP_TYPES, MOCK_CATEGORIES, MOCK_DOCUMENT_TYPES, MOCK_TAGS } from '@/mocks';
import type { CreateDocumentRequest, Document, UpdateDocumentRequest } from '@/types/document';

/**
 * Моковые обработчики для документов
 * Синхронизировано с services/gateway/internal/domain/models.go
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
  async create(data: CreateDocumentRequest): Promise<Document> {
    const primaryAuthor = MOCK_AUTHORS.find(author => author.id === data.participants?.[0]?.authorId) ?? MOCK_AUTHORS[0]!;
    const participants = (data.participants || []).map((participant) => ({
      author: MOCK_AUTHORS.find(author => author.id === participant.authorId) ?? primaryAuthor,
      authorshipType: MOCK_AUTHORSHIP_TYPES.find(type => type.id === participant.typeId) ?? MOCK_AUTHORSHIP_TYPES[0]!,
    }));
    const newDocument = createMockDocument({
      title: data.title,
      description: data.description ?? undefined,
      author: primaryAuthor,
      category: data.categoryId ? (MOCK_CATEGORIES.find(category => category.id === data.categoryId) ?? MOCK_CATEGORIES[0]!) : MOCK_CATEGORIES[0]!,
      documentType: MOCK_DOCUMENT_TYPES.find(type => type.id === data.documentTypeId) ?? MOCK_DOCUMENT_TYPES[0]!,
      participants,
      publication_date: data.publicationDate,
      tags: (data.tagIds || []).map((tagId) => MOCK_TAGS.find(tag => tag.id === tagId)).filter(Boolean) as Document['tags'],
      content: data.content,
    });
    MOCK_DOCUMENTS.push(newDocument);

    const result = await mockApiCall(newDocument, 1000);
    return result.data;
  },

  /**
   * Обновить документ
   */
  async update(id: string, data: UpdateDocumentRequest): Promise<Document> {
    const index = MOCK_DOCUMENTS.findIndex(d => d.id === id);

    if (index === -1) {
      throw new Error('Document not found');
    }

    const baseDocument = MOCK_DOCUMENTS[index]!;

    // Обрабатываем автора - если пришла строка, ищем в моках или оставляем текущего
    const participants = data.participants
      ? data.participants.map((participant) => ({
          author: MOCK_AUTHORS.find(author => author.id === participant.authorId) ?? baseDocument.author,
          authorshipType: MOCK_AUTHORSHIP_TYPES.find(type => type.id === participant.typeId) ?? MOCK_AUTHORSHIP_TYPES[0]!,
        }))
      : baseDocument.participants;
    const author = participants[0]?.author ?? baseDocument.author;
    const category = data.categoryId ? (MOCK_CATEGORIES.find(category => category.id === data.categoryId) ?? baseDocument.category) : baseDocument.category;
    const tags = data.tagIds ? data.tagIds.map(tagId => MOCK_TAGS.find(tag => tag.id === tagId)).filter(Boolean) as Document['tags'] : baseDocument.tags;
    const documentType = data.documentTypeId ? (MOCK_DOCUMENT_TYPES.find(type => type.id === data.documentTypeId) ?? baseDocument.documentType) : baseDocument.documentType;

    const updatedDocument: Document = {
      id: baseDocument.id,
      title: data.title ?? baseDocument.title,
      description: data.description ?? baseDocument.description,
      author,
      category,
      documentType,
      participants,
      publication_date: data.publicationDate ?? baseDocument.publication_date,
      tags,
      content: data.content ?? baseDocument.content,
      created_at: baseDocument.created_at,
      updated_at: new Date().toISOString(),
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

