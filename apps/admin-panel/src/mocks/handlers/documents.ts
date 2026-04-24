import { mockApiCall } from '@/mocks';
import {
    MOCK_DOCUMENTS,
    createMockDocument,
    MOCK_AUTHORS,
    MOCK_CATEGORIES,
    MOCK_TAGS,
    MOCK_AUTHORSHIP_TYPES,
    MOCK_DOCUMENT_TYPES,
} from '@/mocks';
import type {
    CreateDocumentRequest,
    Document,
    DocumentParticipant,
    UpdateDocumentRequest,
} from '@/types/document';

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
    const author = data.participants?.[0]
      ? MOCK_AUTHORS.find(a => a.id === data.participants[0]!.authorId) ?? MOCK_AUTHORS[0]!
      : MOCK_AUTHORS[0]!;

    const category = MOCK_CATEGORIES.find(c => c.id === data.categoryId) ?? MOCK_CATEGORIES[0]!;
    const documentType = MOCK_DOCUMENT_TYPES.find(t => t.id === data.documentTypeId) ?? MOCK_DOCUMENT_TYPES[0]!;
    const tags = (data.tagIds ?? [])
      .map(tagId => MOCK_TAGS.find(t => t.id === tagId))
      .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);

    const participants: DocumentParticipant[] = (data.participants ?? [])
      .map(ref => {
        const refAuthor = MOCK_AUTHORS.find(a => a.id === ref.authorId);
        const refType = MOCK_AUTHORSHIP_TYPES.find(t => t.id === ref.typeId);
        if (!refAuthor || !refType) return null;
        return { author: refAuthor, authorshipType: refType };
      })
      .filter((p): p is DocumentParticipant => p !== null);

    const newDocument = createMockDocument({
      title: data.title,
      description: data.description ?? undefined,
      author,
      category,
      documentType,
      participants,
      publication_date: data.publicationDate,
      tags,
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

    const category = data.categoryId !== undefined
      ? MOCK_CATEGORIES.find(c => c.id === data.categoryId) ?? baseDocument.category
      : baseDocument.category;

    const documentType = data.documentTypeId !== undefined
      ? MOCK_DOCUMENT_TYPES.find(t => t.id === data.documentTypeId) ?? baseDocument.documentType
      : baseDocument.documentType;

    const tags = data.tagIds !== undefined
      ? data.tagIds
          .map(tagId => MOCK_TAGS.find(t => t.id === tagId))
          .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined)
      : baseDocument.tags;

    let participants: DocumentParticipant[] | undefined = baseDocument.participants;
    let author = baseDocument.author;
    if (data.participants !== undefined) {
      participants = data.participants
        .map(ref => {
          const refAuthor = MOCK_AUTHORS.find(a => a.id === ref.authorId);
          const refType = MOCK_AUTHORSHIP_TYPES.find(t => t.id === ref.typeId);
          if (!refAuthor || !refType) return null;
          return { author: refAuthor, authorshipType: refType };
        })
        .filter((p): p is DocumentParticipant => p !== null);
      if (participants.length > 0 && participants[0]) {
        author = participants[0].author;
      }
    }

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

