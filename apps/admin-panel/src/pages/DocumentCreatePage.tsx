import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { UploadProps } from 'antd';
import {
  Alert,
  Button,
  Collapse,
  Form,
  Space,
  Spin,
  Upload,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { documentService } from '../services/document.service';
import { authorService } from '../services/author.service';
import { categoryService } from '../services/category.service';
import { tagService } from '../services/tag.service';
import { documentTypeService } from '../services/documentType.service';
import { authorshipTypeService } from '../services/authorshipType.service';
import type {
  Author,
  AuthorshipType,
  Category,
  CreateDocumentRequest,
  DocumentParticipantRef,
  DocumentType,
  Tag as TagType,
} from '@/types/document';
import './DocumentEditPage.css';
import {
  DocumentEditor,
  DocumentMetaFields,
  FloatingSaveButton,
  PageHeader,
  SectionLabel,
} from '@/components';
import { editorjsToMarkdown, markdownToEditorjsBlocks } from '@/utils/editorjsMarkdown';

interface DocumentFormValues {
  title?: string;
  description?: string;
  publicationDate?: any;
  content?: string;
}

/* Regex hoisted (js-hoist-regexp) */
const YAML_FRONT_MATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
const TITLE_RE = /title:\s*["']?(.+?)["']?\s*$/m;
const AUTHOR_RE = /author:\s*["']?(.+?)["']?\s*$/m;
const TAGS_RE = /tags:\s*\[(.+?)]/;
const CATEGORY_RE = /category:\s*["']?(.+?)["']?\s*$/m;
const DESCRIPTION_RE = /description:\s*["']?(.+?)["']?\s*$/m;

const YamlFrontMatterExample = memo(function YamlFrontMatterExample() {
  return (
    <Alert
      type="info"
      showIcon
      description={
        <div>
          <strong>Пример структуры файла с&nbsp;метаданными:</strong>
          <pre
            style={{
              background: 'var(--paper-soft)',
              padding: 12,
              borderRadius: 4,
              fontSize: 12,
              marginTop: 8,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-700)',
            }}
          >
{`---
title: "Название работы"
author: "Имя Автора"
category: "Эпистемология"
description: "Краткое описание"
tags: ["философия", "наука"]
---

# Содержимое документа

Ваш текст в формате Markdown...`}
          </pre>
        </div>
      }
    />
  );
});

export function DocumentCreatePage() {
  const navigate = useNavigate();
  const [form] = Form.useForm<DocumentFormValues>();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewContent, setContent] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const inlineSaveRef = useRef<HTMLButtonElement>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  /* Reference data */
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [authorshipTypes, setAuthorshipTypes] = useState<AuthorshipType[]>([]);

  /* Selected values */
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<number | undefined>();
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [participants, setParticipants] = useState<DocumentParticipantRef[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  /* Parallel fetch (async-parallel) */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
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
      } catch (error) {
        if (cancelled) return;
        message.error('Ошибка при загрузке данных');
        console.error('Error loading data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBack = useCallback(() => {
    navigate({ to: '/documents' });
  }, [navigate]);

  /* Reference-data extension callbacks */
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

  /* Добавить автора, извлечённого из YAML front matter, с ролью по умолчанию */
  const addAuthorFromYaml = useCallback(
    (authorId: string) => {
      const defaultType =
        authorshipTypes.find((t) => t.title.toLowerCase() === 'автор') ?? authorshipTypes[0];
      if (!defaultType) {
        message.warning('Не удалось определить тип авторства — добавьте участника вручную');
        return;
      }
      setParticipants((prev) => {
        if (prev.some((p) => p.authorId === authorId && p.typeId === defaultType.id)) {
          return prev;
        }
        return [...prev, { authorId, typeId: defaultType.id }];
      });
    },
    [authorshipTypes],
  );

  /* Markdown file handler */
  const handleFileUpload = useCallback(
    async (file: File) => {
      const isMarkdown =
        file.name.endsWith('.md') ||
        file.name.endsWith('.markdown') ||
        file.type === 'text/markdown';
      if (!isMarkdown) {
        message.error('Пожалуйста, загрузите файл в формате Markdown (.md или .markdown)');
        return false;
      }
      if (file.size / 1024 / 1024 >= 5) {
        message.error('Файл не должен превышать 5MB');
        return false;
      }

      try {
        const text = await file.text();
        let content = text;
        const match = text.match(YAML_FRONT_MATTER_RE);

        if (match && match[1] && match[2]) {
          const frontMatter = match[1];
          content = match[2];

          const titleMatch = frontMatter.match(TITLE_RE);
          const authorMatch = frontMatter.match(AUTHOR_RE);
          const tagsMatch = frontMatter.match(TAGS_RE);
          const categoryMatch = frontMatter.match(CATEGORY_RE);
          const descriptionMatch = frontMatter.match(DESCRIPTION_RE);

          if (titleMatch?.[1] && !form.getFieldValue('title')) {
            form.setFieldValue('title', titleMatch[1].trim());
          }
          if (authorMatch?.[1] && participants.length === 0) {
            const authorName = authorMatch[1].trim().toLowerCase();
            const foundAuthor = authors.find(
              (author) =>
                author.name.toLowerCase().includes(authorName) ||
                authorName.includes(author.name.toLowerCase()),
            );
            if (foundAuthor) addAuthorFromYaml(foundAuthor.id);
          }
          if (categoryMatch?.[1] && !selectedCategoryId) {
            const categoryName = categoryMatch[1].trim().toLowerCase();
            const foundCategory = categories.find(
              (category) => category.title.toLowerCase() === categoryName,
            );
            if (foundCategory) setSelectedCategoryId(foundCategory.id);
          }
          if (descriptionMatch?.[1] && !form.getFieldValue('description')) {
            form.setFieldValue('description', descriptionMatch[1].trim());
          }
          if (tagsMatch?.[1] && selectedTagIds.length === 0) {
            const tagNames = tagsMatch[1]
              .split(',')
              .map((tag) => tag.trim().replace(/["']/g, '').toLowerCase());
            const foundTagIds = tags
              .filter((tag) => tagNames.includes(tag.title.toLowerCase()))
              .map((tag) => tag.id);
            if (foundTagIds.length > 0) setSelectedTagIds(foundTagIds);
          }

          message.success('Метаданные из файла успешно извлечены');
        }

        const editorBlocks = markdownToEditorjsBlocks(content);
        const editorJson = JSON.stringify({
          time: Date.now(),
          version: '2.31.0',
          blocks: editorBlocks,
        });

        form.setFieldValue('content', editorJson);
        setContent(editorJson);
        setUploadedFileName(file.name);

        if (!match) {
          const lines = content.split('\n');
          const firstLine = lines[0]?.trim();
          if (firstLine && firstLine.startsWith('#')) {
            const title = firstLine.replace(/^#+\s*/, '');
            if (!form.getFieldValue('title')) {
              form.setFieldValue('title', title);
            }
          }
        }

        message.success(`Файл "${file.name}" успешно загружен`);
      } catch (error) {
        message.error('Ошибка при чтении файла');
        console.error('Error reading file:', error);
      }
      return false;
    },
    [
      form,
      authors,
      categories,
      tags,
      participants.length,
      selectedCategoryId,
      selectedTagIds.length,
      addAuthorFromYaml,
    ],
  );

  const uploadProps: UploadProps = useMemo(
    () => ({
      name: 'file',
      multiple: false,
      accept: '.md,.markdown,text/markdown',
      beforeUpload: handleFileUpload,
      showUploadList: false,
    }),
    [handleFileUpload],
  );

  const validateExtras = useCallback((): string | null => {
    if (!selectedDocumentTypeId) return 'Выберите тип документа';
    if (!selectedCategoryId) return 'Выберите категорию';
    if (participants.length === 0) return 'Добавьте хотя бы одного участника';
    if (selectedTagIds.length === 0) return 'Добавьте хотя бы один тег';
    return null;
  }, [selectedDocumentTypeId, selectedCategoryId, participants.length, selectedTagIds.length]);

  const handleCreate = useCallback(
    async (values: DocumentFormValues) => {
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

        const documentData: CreateDocumentRequest = {
          title: values.title!,
          description: values.description ? values.description : null,
          categoryId: selectedCategoryId!,
          documentTypeId: selectedDocumentTypeId!,
          participants,
          publicationDate: values.publicationDate!.toISOString(),
          tagIds: selectedTagIds,
          content: markdownContent,
          isPublic,
        };

        const newDocument = await documentService.create(documentData);

        if (coverFile) {
          try {
            await documentService.uploadCover(newDocument.id, coverFile);
          } catch {
            message.warning('Документ создан, но не удалось загрузить обложку');
          }
        }

        message.success('Документ успешно создан');
        navigate({ to: `/documents/${newDocument.id}` });
      } catch (err) {
        message.error('Ошибка при создании документа');
        console.error('Error creating document:', err);
      } finally {
        setSaving(false);
      }
    },
    [
      validateExtras,
      selectedCategoryId,
      selectedDocumentTypeId,
      participants,
      selectedTagIds,
      coverFile,
      navigate,
      isPublic,
    ],
  );

  const handleContentChange = useCallback(
    (value: string) => {
      form.setFieldValue('content', value);
      setContent(value);
    },
    [form],
  );

  const handleClearContent = useCallback(() => {
    form.setFieldValue('content', '');
    setContent('');
    setUploadedFileName(null);
    message.info('Содержимое очищено');
  }, [form]);

  return (
    <div>
      <PageHeader
        eyebrow="Новый документ"
        title="Добавление работы"
        description="Заполните метаданные и содержимое документа. Поддерживается загрузка Markdown-файла с YAML-заголовком."
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack} size="large">
            Назад
          </Button>
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Загрузка данных…" />
        </div>
      ) : (
        <Form<DocumentFormValues> form={form} layout="vertical" onFinish={handleCreate}>
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
            isPublic={isPublic}
            onPublicChange={setIsPublic}
          />

          <SectionLabel marginTop={16}>Импорт Markdown</SectionLabel>

          <Form.Item>
            <Upload.Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Нажмите или перетащите Markdown файл в&nbsp;эту область
              </p>
              <p className="ant-upload-hint">
                Поддерживаются файлы форматов .md и&nbsp;.markdown (максимум 5&nbsp;MB)
                <br />
                Метаданные из&nbsp;YAML front matter будут автоматически извлечены
              </p>
              {uploadedFileName && (
                <p
                  style={{
                    marginTop: 8,
                    color: 'var(--forest)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                  }}
                >
                  ✓ Загружен: {uploadedFileName}
                </p>
              )}
            </Upload.Dragger>

            <Collapse
              ghost
              style={{ marginTop: 16 }}
              items={[
                {
                  key: '1',
                  label: (
                    <span>
                      <InfoCircleOutlined style={{ marginRight: 8 }} />
                      Как использовать YAML front matter
                    </span>
                  ),
                  children: <YamlFrontMatterExample />,
                },
              ]}
            />
          </Form.Item>

          <SectionLabel marginTop={16}>Содержание</SectionLabel>

          <Form.Item
            name="content"
            label={
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <span>Текст документа</span>
                {previewContent && (
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={handleClearContent}
                    style={{ padding: 0 }}
                  >
                    Очистить
                  </Button>
                )}
              </div>
            }
            rules={[
              { required: true, message: 'Пожалуйста, введите содержание документа' },
              { min: 10, message: 'Содержание должно содержать минимум 10 символов' },
            ]}
          >
            <DocumentEditor onChange={handleContentChange} value={previewContent} />
          </Form.Item>

          <Form.Item>
            <Space size="middle">
              <Button
                ref={inlineSaveRef}
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
                loading={saving}
              >
                Создать документ
              </Button>
              <Button size="large" onClick={handleBack}>
                Отмена
              </Button>
            </Space>
          </Form.Item>

          <FloatingSaveButton
            form={form}
            loading={saving}
            label="Создать документ"
            inlineRef={inlineSaveRef}
          />
        </Form>
      )}
    </div>
  );
}
