import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Alert, Button, Form, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { documentService } from '@/services/document.service';
import { authorService } from '@/services/author.service';
import { categoryService } from '@/services/category.service';
import { tagService } from '@/services/tag.service';
import { documentTypeService } from '@/services/documentType.service';
import { authorshipTypeService } from '@/services/authorshipType.service';
import type {
  Author,
  AuthorshipType,
  Category,
  Document,
  DocumentParticipantRef,
  DocumentType,
  Tag as TagType,
  UpdateDocumentRequest,
} from '@/types/document';
import './DocumentEditPage.css';
import {
  DocumentEditor,
  DocumentMetaFields,
  PageHeader,
  SectionLabel,
} from '@/components';
import { editorjsToMarkdown, markdownToEditorjsBlocks } from '@/utils/editorjsMarkdown';

interface EditDocumentFormValues {
  title?: string;
  description?: string;
  publicationDate?: any;
  content?: string;
}

export function DocumentEditPage() {
  const params = useParams({ strict: false });
  const id = (params as any).id;
  const navigate = useNavigate();
  const [form] = Form.useForm<EditDocumentFormValues>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<Document | null>(null);

  /* Reference data */
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [authorshipTypes, setAuthorshipTypes] = useState<AuthorshipType[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  /* Selected values */
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<number | undefined>();
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [participants, setParticipants] = useState<DocumentParticipantRef[]>([]);

  const [editorContent, setEditorContent] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    navigate({ to: '/documents' });
  }, [navigate]);

  /* -- Parallel loads (async-parallel) -- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingMetadata(true);
        const [authorsData, categoriesData, tagsData, docTypesData, authorshipData] =
          await Promise.all([
            authorService.getAll(),
            categoryService.getAll(),
            tagService.getAll(),
            documentTypeService.getAll(),
            authorshipTypeService.getAll(),
          ]);
        if (cancelled) return;
        setAuthors(authorsData);
        setCategories(categoriesData);
        setTags(tagsData);
        setDocumentTypes(docTypesData);
        setAuthorshipTypes(authorshipData);
      } catch (err) {
        if (cancelled) return;
        message.error('Не удалось загрузить данные');
        console.error('Error loading metadata:', err);
      } finally {
        if (!cancelled) setLoadingMetadata(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await documentService.getById(id);
        if (cancelled) return;

        setDocument(data);
        setSelectedCategoryId(data.category?.id);
        setSelectedDocumentTypeId(data.documentType?.id);
        setSelectedTagIds(data.tags?.map((tag) => tag.id) ?? []);

        if (data.participants && data.participants.length > 0) {
          setParticipants(
            data.participants.map((p) => ({
              authorId: p.author.id,
              typeId: p.authorshipType.id,
            })),
          );
        } else if (data.author) {
          /* Fallback для старых документов: один автор с ролью «автор»; реальный typeId
             подтянется в отдельном эффекте, когда справочник загрузится. */
          setParticipants([{ authorId: data.author.id, typeId: 0 }]);
        } else {
          setParticipants([]);
        }

        if (data.cover_url) setCoverPreview(data.cover_url);

        const rawContent = data.content || '';
        let editorContentValue = rawContent;
        try {
          const parsed = JSON.parse(rawContent);
          if (!Array.isArray(parsed?.blocks)) throw new Error('not editorjs');
        } catch {
          const blocks = markdownToEditorjsBlocks(rawContent);
          editorContentValue = JSON.stringify({
            time: Date.now(),
            version: '2.31.0',
            blocks,
          });
        }

        setEditorContent(editorContentValue);
        form.setFieldsValue({
          title: data.title,
          description: data.description ?? undefined,
          publicationDate: data.publication_date ? dayjs(data.publication_date) : undefined,
          content: editorContentValue,
        });
      } catch (err) {
        if (cancelled) return;
        setError('Не удалось загрузить документ');
        console.error('Error loading document:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, form]);

  /* Подтягиваем корректный typeId для fallback participant после загрузки справочника */
  useEffect(() => {
    if (authorshipTypes.length === 0 || participants.length === 0) return;
    const needsFix = participants.some((p) => p.typeId === 0);
    if (!needsFix) return;

    const defaultType =
      authorshipTypes.find((t) => t.title.toLowerCase() === 'автор') ?? authorshipTypes[0];
    if (!defaultType) return;

    setParticipants((prev) =>
      prev.map((p) => (p.typeId === 0 ? { ...p, typeId: defaultType.id } : p)),
    );
  }, [authorshipTypes, participants]);

  const handleAddAuthor = useCallback((author: Author) => {
    setAuthors((prev) => [...prev, author]);
  }, []);
  const handleAddCategory = useCallback((category: Category) => {
    setCategories((prev) => [...prev, category]);
  }, []);
  const handleAddTag = useCallback((tag: TagType) => {
    setTags((prev) => [...prev, tag]);
  }, []);

  const handleCoverChange = useCallback((file: File | null, preview: string | null) => {
    setCoverFile(file);
    setCoverPreview(preview);
  }, []);

  const validateExtras = useCallback((): string | null => {
    if (!selectedDocumentTypeId) return 'Выберите тип документа';
    if (!selectedCategoryId) return 'Выберите категорию';
    if (participants.length === 0) return 'Добавьте хотя бы одного участника';
    if (selectedTagIds.length === 0) return 'Добавьте хотя бы один тег';
    return null;
  }, [selectedDocumentTypeId, selectedCategoryId, participants.length, selectedTagIds.length]);

  const handleSave = useCallback(
    async (values: EditDocumentFormValues) => {
      if (!document) return;
      const extrasError = validateExtras();
      if (extrasError) {
        message.error(extrasError);
        return;
      }

      try {
        setSaving(true);
        const rawContent: string = values.content || '';
        let markdownContent = rawContent;
        try {
          const parsed = JSON.parse(rawContent);
          if (Array.isArray(parsed?.blocks)) {
            markdownContent = editorjsToMarkdown(parsed);
          }
        } catch {
          /* already Markdown — send as is */
        }

        const updatedData: UpdateDocumentRequest = {
          title: values.title,
          description: values.description ? values.description : null,
          categoryId: selectedCategoryId,
          documentTypeId: selectedDocumentTypeId,
          participants,
          publicationDate: values.publicationDate?.toISOString(),
          tagIds: selectedTagIds,
          content: markdownContent,
        };

        await documentService.update(document.id, updatedData);

        if (coverFile) {
          try {
            const url = await documentService.uploadCover(document.id, coverFile);
            setCoverPreview(url);
            setCoverFile(null);
          } catch {
            message.warning('Документ сохранён, но не удалось загрузить обложку');
          }
        }

        message.success('Документ успешно сохранён');
        navigate({ to: `/documents/${document.id}` });
      } catch (err) {
        message.error('Ошибка при сохранении документа');
        console.error('Error saving document:', err);
      } finally {
        setSaving(false);
      }
    },
    [
      document,
      validateExtras,
      selectedCategoryId,
      selectedDocumentTypeId,
      participants,
      selectedTagIds,
      coverFile,
      navigate,
    ],
  );

  const handleContentChange = useCallback(
    (value: string) => {
      setEditorContent(value);
      form.setFieldValue('content', value);
    },
    [form],
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Загрузка документа…" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
          Назад к списку
        </Button>
        <Alert
          message="Ошибка"
          description={error || 'Документ не найден'}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Редактирование"
        title={document.title || 'Редактирование документа'}
        description="Обновите метаданные и&nbsp;содержание научной работы. Изменения применяются сразу после сохранения."
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack} size="large">
            Назад
          </Button>
        }
      />

      <Form<EditDocumentFormValues> form={form} layout="vertical" onFinish={handleSave}>
        <SectionLabel>Метаданные</SectionLabel>

        <DocumentMetaFields
          authors={authors}
          categories={categories}
          tags={tags}
          documentTypes={documentTypes}
          authorshipTypes={authorshipTypes}
          selectedCategoryId={selectedCategoryId}
          selectedDocumentTypeId={selectedDocumentTypeId}
          selectedTagIds={selectedTagIds}
          participants={participants}
          onCategoryChange={setSelectedCategoryId}
          onDocumentTypeChange={setSelectedDocumentTypeId}
          onTagsChange={setSelectedTagIds}
          onParticipantsChange={setParticipants}
          onAddAuthor={handleAddAuthor}
          onAddCategory={handleAddCategory}
          onAddTag={handleAddTag}
          coverFile={coverFile}
          coverPreview={coverPreview}
          onCoverChange={handleCoverChange}
          originalCoverUrl={document.cover_url ?? null}
          metadataLoading={loadingMetadata}
        />

        <SectionLabel marginTop={16}>Содержание</SectionLabel>

        <Form.Item
          name="content"
          label="Текст документа"
          rules={[
            { required: true, message: 'Пожалуйста, введите содержание документа' },
            { min: 10, message: 'Содержание должно содержать минимум 10 символов' },
          ]}
        >
          <DocumentEditor onChange={handleContentChange} value={editorContent} />
        </Form.Item>

        <Form.Item>
          <Space size="middle">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={saving}
            >
              Сохранить изменения
            </Button>
            <Button size="large" onClick={handleBack}>
              Отмена
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
