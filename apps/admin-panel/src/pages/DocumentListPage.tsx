import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Input, Modal, Space, Table, Tag, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { documentService } from '@/services/document.service';
import { PageHeader } from '@/components';
import type {
  Document as DocumentType,
  DocumentParticipant,
  Tag as TagType,
} from '@/types/document';

/* ------------------------------------------------------------------ */
/* Helpers hoisted outside the component.                             */
/* ------------------------------------------------------------------ */

const titleCellStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: 15,
  letterSpacing: '-0.005em',
  color: 'var(--ink-900)',
  lineHeight: 1.3,
};

const MAX_PARTICIPANTS_INLINE = 2;
const UNSPECIFIED_TYPE = 'Не указан';

/**
 * Возвращает список участников для отображения.
 * Если `participants` отсутствует/пуст, делаем fallback на primary `author`
 * (для совместимости со старыми документами).
 */
function resolveParticipants(doc: DocumentType): DocumentParticipant[] {
  if (doc.participants && doc.participants.length > 0) return doc.participants;
  if (doc.author) {
    return [
      {
        author: doc.author,
        authorshipType: { id: 0, title: 'автор' },
      },
    ];
  }
  return [];
}

function matches(doc: DocumentType, search: string): boolean {
  if (!search) return true;
  const q = search.toLowerCase();

  if (doc.title?.toLowerCase().includes(q)) return true;
  if (doc.category?.title.toLowerCase().includes(q)) return true;
  if (doc.documentType?.name.toLowerCase().includes(q)) return true;

  const participants = resolveParticipants(doc);
  for (let i = 0; i < participants.length; i++) {
    const p = participants[i]!;
    if (p.author.name.toLowerCase().includes(q)) return true;
    if (p.authorshipType.title.toLowerCase().includes(q)) return true;
  }

  const tags = doc.tags;
  if (tags) {
    for (let i = 0; i < tags.length; i++) {
      if (tags[i]!.title.toLowerCase().includes(q)) return true;
    }
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* ParticipantsCell — компактное отображение участников в строке.     */
/* ------------------------------------------------------------------ */

const participantTagStyle: React.CSSProperties = {
  background: 'var(--paper-deep)',
  borderColor: 'var(--hairline-strong)',
  color: 'var(--ink-800)',
  padding: '2px 8px',
  margin: 0,
  fontSize: 12,
  maxWidth: 220,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const ParticipantsCell = memo(function ParticipantsCell({
  participants,
}: {
  participants: DocumentParticipant[];
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
        —
      </span>
    );
  }

  const inline = participants.slice(0, MAX_PARTICIPANTS_INLINE);
  const rest = participants.length - inline.length;

  const overflowLabel =
    rest > 0
      ? participants
          .slice(MAX_PARTICIPANTS_INLINE)
          .map((p) => `${p.author.name} · ${p.authorshipType.title}`)
          .join('\n')
      : '';

  return (
    <Space size={[6, 6]} wrap>
      {inline.map((p, idx) => (
        <Tag
          key={`${p.author.id}-${p.authorshipType.id}-${idx}`}
          style={participantTagStyle}
          title={`${p.author.name} · ${p.authorshipType.title}`}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
            }}
          >
            {p.author.name}
          </span>
          <span
            style={{
              color: 'var(--ink-500)',
              marginLeft: 6,
              fontSize: 11,
              letterSpacing: '0.02em',
            }}
          >
            {p.authorshipType.title}
          </span>
        </Tag>
      ))}
      {rest > 0 && (
        <Tooltip
          title={<span style={{ whiteSpace: 'pre-line' }}>{overflowLabel}</span>}
          placement="topLeft"
        >
          <Tag
            style={{
              background: 'var(--surface-muted)',
              borderColor: 'var(--hairline)',
              color: 'var(--ink-500)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '2px 8px',
              margin: 0,
              cursor: 'help',
            }}
          >
            +{rest}
          </Tag>
        </Tooltip>
      )}
    </Space>
  );
});

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export function DocumentListPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentService.getAll();
      setDocuments(data.documents);
    } catch (error) {
      message.error('Ошибка при загрузке документов');
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // TODO: вынести фильтрацию на ответственность бэкенда
  const filteredDocuments = useMemo(
    () => documents.filter((doc) => matches(doc, searchText)),
    [documents, searchText],
  );

  const categoryFilters = useMemo(
    () =>
      Array.from(new Set(documents.map((doc) => doc.category.title))).map((title) => ({
        text: title,
        value: title,
      })),
    [documents],
  );

  const documentTypeFilters = useMemo(
    () =>
      Array.from(
        new Set(documents.map((doc) => doc.documentType?.name ?? UNSPECIFIED_TYPE)),
      ).map((name) => ({ text: name, value: name })),
    [documents],
  );

  const handleView = useCallback(
    (record: DocumentType) => {
      navigate({ to: `/documents/${record.id}` });
    },
    [navigate],
  );

  const handleEdit = useCallback(
    (record: DocumentType) => {
      navigate({ to: `/documents/${record.id}/edit` });
    },
    [navigate],
  );

  const handleDelete = useCallback(
    (record: DocumentType) => {
      Modal.confirm({
        title: 'Удалить документ?',
        icon: <ExclamationCircleOutlined />,
        content: (
          <span>
            Документ <em>«{record.title}»</em> будет удалён безвозвратно.
          </span>
        ),
        okText: 'Удалить',
        okType: 'danger',
        cancelText: 'Отмена',
        onOk: async () => {
          try {
            await documentService.delete(record.id);
            message.success('Документ удалён');
            await loadDocuments();
          } catch (error) {
            message.error('Ошибка при удалении документа');
            console.error('Error deleting document:', error);
          }
        },
      });
    },
    [loadDocuments],
  );

  const handleCreate = useCallback(() => {
    navigate({ to: '/documents/new' });
  }, [navigate]);

  const columns: ColumnsType<DocumentType> = useMemo(
    () => [
      {
        title: 'Название',
        dataIndex: 'title',
        key: 'title',
        width: '24%',
        sorter: (a, b) => a.title.localeCompare(b.title),
        render: (title: string) => <span style={titleCellStyle}>{title}</span>,
      },
      {
        title: 'Участники',
        key: 'participants',
        width: '24%',
        render: (_, record) => (
          <ParticipantsCell participants={resolveParticipants(record)} />
        ),
      },
      {
        title: 'Тип',
        key: 'documentType',
        width: '12%',
        filters: documentTypeFilters,
        onFilter: (value, record) =>
          (record.documentType?.name ?? UNSPECIFIED_TYPE) === value,
        sorter: (a, b) =>
          (a.documentType?.name ?? '').localeCompare(b.documentType?.name ?? ''),
        render: (_, record) => {
          const name = record.documentType?.name;
          if (!name) {
            return (
              <span
                style={{
                  color: 'var(--ink-400)',
                  fontStyle: 'italic',
                  fontFamily: 'var(--font-display)',
                  fontSize: 13,
                }}
              >
                —
              </span>
            );
          }
          return (
            <Tag
              style={{
                background: 'var(--ochre-soft)',
                color: 'var(--ochre-deep)',
                borderColor: 'var(--ochre)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.04em',
                textTransform: 'lowercase',
              }}
            >
              {name}
            </Tag>
          );
        },
      },
      {
        title: 'Категория',
        dataIndex: ['category', 'title'],
        key: 'category',
        width: '12%',
        filters: categoryFilters,
        onFilter: (value, record) => record.category.title === value,
        render: (title: string) => (
          <Tag
            style={{
              background: 'var(--paper-deep)',
              color: 'var(--ink-700)',
              borderColor: 'var(--hairline-strong)',
            }}
          >
            {title}
          </Tag>
        ),
      },
      {
        title: 'Теги',
        dataIndex: 'tags',
        key: 'tags',
        width: '18%',
        render: (tags: TagType[]) => (
          <Space size={[4, 4]} wrap>
            {tags?.map((tag) => (
              <Tag
                key={tag.id}
                style={{
                  background: '#eef0f6',
                  color: 'var(--ink-700)',
                  borderColor: '#d7dbe6',
                }}
              >
                {tag.title}
              </Tag>
            ))}
          </Space>
        ),
      },
      {
        title: '',
        key: 'actions',
        width: 140,
        align: 'right',
        render: (_, record) => (
          <Space size={2}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleView(record);
              }}
              aria-label="Просмотреть"
            />
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
              aria-label="Редактировать"
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(record);
              }}
              aria-label="Удалить"
            />
          </Space>
        ),
      },
    ],
    [categoryFilters, documentTypeFilters, handleView, handleEdit, handleDelete],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Каталог"
        title="Научные работы философов"
        description="Все документы библиотеки: оригиналы, переводы и комментарии. Добавляйте новые работы, редактируйте метаданные, следите за каталогом."
        actions={
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreate}>
            Добавить документ
          </Button>
        }
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        <Input
          placeholder="Поиск по названию, участникам, типу, категории или тегам"
          allowClear
          size="large"
          prefix={<SearchOutlined style={{ color: 'var(--ink-400)' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 480, flex: 1 }}
        />
        <span className="mono-meta" style={{ marginLeft: 'auto' }}>
          Найдено: {filteredDocuments.length} / {documents.length}
        </span>
      </div>

      <Table<DocumentType>
        columns={columns}
        dataSource={filteredDocuments}
        loading={loading}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleView(record),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Всего документов: ${total}`,
        }}
      />
    </div>
  );
}
