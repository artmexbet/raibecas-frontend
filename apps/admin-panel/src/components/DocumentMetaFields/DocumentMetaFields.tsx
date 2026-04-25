import { memo, useCallback, useMemo, useState } from 'react';
import { Button, Col, DatePicker, Form, Input, Row, Space, Tag, Upload, message } from 'antd';
import {
  AppstoreOutlined,
  FileTextOutlined,
  InboxOutlined,
  TagsOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type {
  Author,
  AuthorshipType,
  Category,
  DocumentParticipantRef,
  DocumentType,
  Tag as TagType,
} from '@/types/document';
import { SelectorField } from '@/components';
import {
  CategorySelectModal,
  DocumentTypeSelectModal,
  ParticipantsSelectModal,
  TagSelectModal,
} from '@/components';

const { TextArea } = Input;

export interface DocumentMetaFieldsProps {
  /** Reference data */
  authors: Author[];
  categories: Category[];
  tags: TagType[];
  documentTypes: DocumentType[];
  authorshipTypes: AuthorshipType[];

  /** Currently selected values */
  selectedCategoryId: number | undefined;
  selectedDocumentTypeId: number | undefined;
  selectedTagIds: number[];
  participants: DocumentParticipantRef[];

  /** Setters for selected values */
  onCategoryChange: (id: number) => void;
  onDocumentTypeChange: (id: number) => void;
  onTagsChange: (ids: number[]) => void;
  onParticipantsChange: (next: DocumentParticipantRef[]) => void;

  /** Callbacks that notify the parent when reference data is extended. */
  onAddAuthor: (author: Author) => void;
  onAddCategory: (category: Category) => void;
  onAddTag: (tag: TagType) => void;

  /** Cover upload */
  coverFile: File | null;
  coverPreview: string | null;
  onCoverChange: (file: File | null, previewUrl: string | null) => void;
  originalCoverUrl?: string | null;

  /** Loading indicator for reference-data fetches */
  metadataLoading?: boolean;
}

/* ------------------------------------------------------------------ */
/* ParticipantsPreview — reused in both pages                         */
/* ------------------------------------------------------------------ */

export const ParticipantsPreview = memo(function ParticipantsPreview({
  participants,
  authorsById,
  authorshipById,
}: {
  participants: DocumentParticipantRef[];
  authorsById: Map<string, Author>;
  authorshipById: Map<number, AuthorshipType>;
}) {
  if (participants.length === 0) {
    return (
      <span
        style={{
          color: 'var(--ink-400)',
          fontStyle: 'italic',
          fontFamily: 'var(--font-display)',
        }}
      >
        Никто не выбран
      </span>
    );
  }
  return (
    <Space size={[6, 6]} wrap>
      {participants.map((p, idx) => {
        const author = authorsById.get(p.authorId);
        const role = authorshipById.get(p.typeId);
        return (
          <Tag
            key={`${p.authorId}-${p.typeId}-${idx}`}
            style={{
              background: 'var(--paper-deep)',
              borderColor: 'var(--hairline-strong)',
              color: 'var(--ink-800)',
              padding: '4px 10px',
              fontSize: 12,
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              {author?.name ?? 'Неизвестный автор'}
            </span>{' '}
            ·{' '}
            <span style={{ color: 'var(--ink-500)', letterSpacing: '0.02em' }}>
              {role?.title ?? 'неизвестная роль'}
            </span>
          </Tag>
        );
      })}
    </Space>
  );
});

/* ------------------------------------------------------------------ */
/* DocumentMetaFields — the shared form body for create + edit pages  */
/* ------------------------------------------------------------------ */

export const DocumentMetaFields = memo(function DocumentMetaFields({
  authors,
  categories,
  tags,
  documentTypes,
  authorshipTypes,
  selectedCategoryId,
  selectedDocumentTypeId,
  selectedTagIds,
  participants,
  onCategoryChange,
  onDocumentTypeChange,
  onTagsChange,
  onParticipantsChange,
  onAddAuthor,
  onAddCategory,
  onAddTag,
  coverFile,
  coverPreview,
  onCoverChange,
  originalCoverUrl,
  metadataLoading,
}: DocumentMetaFieldsProps) {
  const [documentTypeModalVisible, setDocumentTypeModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);

  /* -- derived maps for O(1) lookups -- */
  const authorsById = useMemo(() => {
    const map = new Map<string, Author>();
    for (let i = 0; i < authors.length; i++) {
      const a = authors[i]!;
      map.set(a.id, a);
    }
    return map;
  }, [authors]);

  const authorshipById = useMemo(() => {
    const map = new Map<number, AuthorshipType>();
    for (let i = 0; i < authorshipTypes.length; i++) {
      const t = authorshipTypes[i]!;
      map.set(t.id, t);
    }
    return map;
  }, [authorshipTypes]);

  const tagsById = useMemo(() => {
    const map = new Map<number, TagType>();
    for (let i = 0; i < tags.length; i++) {
      const t = tags[i]!;
      map.set(t.id, t);
    }
    return map;
  }, [tags]);

  const selectedDocumentType = useMemo(
    () => documentTypes.find((t) => t.id === selectedDocumentTypeId),
    [documentTypes, selectedDocumentTypeId],
  );
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  /* -- cover upload handlers -- */
  const handleBeforeCoverUpload = useCallback(
    (file: File) => {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        message.error('Допустимые форматы: JPEG, PNG, WebP');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error('Файл обложки не должен превышать 5 МБ');
        return false;
      }
      onCoverChange(file, URL.createObjectURL(file));
      return false;
    },
    [onCoverChange],
  );

  const handleRevertCover = useCallback(() => {
    onCoverChange(null, originalCoverUrl ?? null);
  }, [onCoverChange, originalCoverUrl]);

  const handleClearCover = useCallback(() => {
    onCoverChange(null, null);
  }, [onCoverChange]);

  return (
    <>
      <Form.Item
        name="title"
        label="Название"
        rules={[
          { required: true, message: 'Пожалуйста, введите название документа' },
          { min: 3, message: 'Название должно содержать минимум 3 символа' },
        ]}
      >
        <Input size="large" placeholder="Введите название документа" />
      </Form.Item>

      <Form.Item label="Тип документа" required>
        <SelectorField
          icon={<FileTextOutlined />}
          label="Категория формата"
          placeholder="Выберите тип документа"
          value={selectedDocumentType?.name}
          onClick={() => setDocumentTypeModalVisible(true)}
          loading={metadataLoading}
        />
      </Form.Item>

      <Form.Item label="Участники" required>
        <Space direction="vertical" style={{ width: '100%' }} size={10}>
          <SelectorField
            icon={<TeamOutlined />}
            label="Авторы и соавторы"
            placeholder="Добавить участников"
            value={participants.length > 0 ? `Участников: ${participants.length}` : undefined}
            onClick={() => setParticipantsModalVisible(true)}
            loading={metadataLoading}
          />
          <ParticipantsPreview
            participants={participants}
            authorsById={authorsById}
            authorshipById={authorshipById}
          />
        </Space>
      </Form.Item>

      <Form.Item name="description" label="Описание / Аннотация">
        <TextArea rows={3} placeholder="Краткое описание документа (опционально)" />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Категория" required>
            <SelectorField
              icon={<AppstoreOutlined />}
              label="Тематический раздел"
              placeholder="Выберите категорию"
              value={selectedCategory?.title}
              onClick={() => setCategoryModalVisible(true)}
              loading={metadataLoading}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="publicationDate"
            label="Дата публикации"
            rules={[{ required: true, message: 'Пожалуйста, выберите дату публикации' }]}
          >
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              placeholder="Выберите дату"
              format="DD.MM.YYYY"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Теги" required>
        <Space direction="vertical" style={{ width: '100%' }} size={10}>
          <SelectorField
            icon={<TagsOutlined />}
            label="Ключевые слова"
            placeholder="Выберите теги"
            value={selectedTagIds.length > 0 ? `Выбрано тегов: ${selectedTagIds.length}` : undefined}
            onClick={() => setTagModalVisible(true)}
          />
          {selectedTagIds.length > 0 && (
            <Space size={[6, 6]} wrap>
              {selectedTagIds.map((id) => {
                const tag = tagsById.get(id);
                return tag ? (
                  <Tag
                    key={id}
                    style={{
                      background: '#eef0f6',
                      color: 'var(--ink-700)',
                      borderColor: '#d7dbe6',
                    }}
                  >
                    {tag.title}
                  </Tag>
                ) : null;
              })}
            </Space>
          )}
        </Space>
      </Form.Item>

      <Form.Item label="Обложка документа">
        <Upload
          accept="image/jpeg,image/png,image/webp"
          maxCount={1}
          showUploadList={false}
          beforeUpload={handleBeforeCoverUpload}
        >
          <Button icon={<InboxOutlined />}>
            {coverPreview ? 'Заменить обложку' : 'Выбрать обложку'}
          </Button>
        </Upload>
        {coverPreview && (
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'flex-start', gap: 12 }}>
            <img
              src={coverPreview}
              alt="Превью обложки"
              style={{
                maxWidth: 320,
                maxHeight: 180,
                borderRadius: 8,
                objectFit: 'cover',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--shadow-sm)',
              }}
            />
            <Space direction="vertical" size={6}>
              {coverFile && originalCoverUrl !== undefined && (
                <Button size="small" onClick={handleRevertCover}>
                  Отменить
                </Button>
              )}
              <Button size="small" danger onClick={handleClearCover}>
                Удалить
              </Button>
            </Space>
          </div>
        )}
      </Form.Item>

      <DocumentTypeSelectModal
        visible={documentTypeModalVisible}
        documentTypes={documentTypes}
        selectedId={selectedDocumentTypeId}
        onClose={() => setDocumentTypeModalVisible(false)}
        onSelect={onDocumentTypeChange}
      />

      <CategorySelectModal
        visible={categoryModalVisible}
        categories={categories}
        selectedId={selectedCategoryId}
        onClose={() => setCategoryModalVisible(false)}
        onSelect={onCategoryChange}
        onAddCategory={onAddCategory}
      />

      <ParticipantsSelectModal
        visible={participantsModalVisible}
        authors={authors}
        authorshipTypes={authorshipTypes}
        selectedParticipants={participants}
        onClose={() => setParticipantsModalVisible(false)}
        onSelect={onParticipantsChange}
        onAddAuthor={onAddAuthor}
      />

      <TagSelectModal
        visible={tagModalVisible}
        tags={tags}
        selectedTagIds={selectedTagIds}
        onClose={() => setTagModalVisible(false)}
        onSelect={onTagsChange}
        onAddTag={onAddTag}
      />
    </>
  );
});
