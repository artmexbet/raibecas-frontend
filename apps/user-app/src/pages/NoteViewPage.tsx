import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Result, Row, Spin, Typography, message, theme } from 'antd';
import { EditOutlined, ExportOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from '@tanstack/react-router';
import { AppHeader } from '@/components/common/AppHeader';
import { BottomNavBar } from '@/components/common/BottomNavBar';
import { PageBackground } from '@/components/common/PageBackground';
import { noteService } from '@/services/note.service';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { NoteItem } from '@/types/note';

const { Title, Text, Paragraph } = Typography;

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

/** Извлекает заголовки из EditorJS JSON для оглавления. */
function extractToc(content: string): TocEntry[] {
  const trimmed = content.trim();
  if (!trimmed.startsWith('{')) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed?.blocks)) return [];

    return parsed.blocks
      .filter((b: { type: string }) => b.type === 'header')
      .map((b: { data?: { text?: string; level?: number } }, idx: number) => ({
        id: `heading-${idx}`,
        text: (b.data?.text ?? '').replace(/<[^>]+>/g, ''),
        level: b.data?.level ?? 2,
      }));
  } catch {
    return [];
  }
}

/** Рендерит EditorJS JSON в HTML-подобный текст. */
function renderContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed.startsWith('{')) return trimmed;

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed?.blocks)) return trimmed;

    return parsed.blocks
      .map((block: { type: string; data?: Record<string, unknown> }) => {
        const data = block.data ?? {};
        switch (block.type) {
          case 'header': {
            const text = (data.text as string) ?? '';
            return text;
          }
          case 'paragraph':
            return (data.text as string) ?? '';
          case 'list': {
            const items = (data.items as string[]) ?? [];
            return items.join('\n');
          }
          case 'quote':
            return `«${(data.text as string) ?? ''}»`;
          case 'delimiter':
            return '---';
          default: {
            if (typeof data.text === 'string') return data.text;
            return '';
          }
        }
      })
      .filter(Boolean)
      .join('\n\n');
  } catch {
    return trimmed;
  }
}

/** Экспортирует заметку как .txt файл. */
function exportNote(note: NoteItem) {
  const text = `${note.title}\n\n${renderContent(note.content)}`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${note.title.slice(0, 50).replace(/[/\\?%*:|"<>]/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function NoteViewPage() {
  const { id } = useParams({ from: '/notes/$id' });
  const [note, setNote] = useState<NoteItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

  const fetchNote = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await noteService.getById(id);
      setNote(result.item);
    } catch {
      setError('Не удалось загрузить заметку');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const toc = useMemo(() => (note ? extractToc(note.content) : []), [note]);
  const renderedContent = useMemo(() => (note ? renderContent(note.content) : ''), [note]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: token.colorBgLayout }}>
        <AppHeader showSearch={false} />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
        <BottomNavBar />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div style={{ minHeight: '100vh', background: token.colorBgLayout }}>
        <AppHeader showSearch={false} />
        <Result
          status="error"
          title="Ошибка"
          subTitle={error ?? 'Заметка не найдена'}
          extra={
            <Button type="primary" onClick={() => navigate({ to: '/notes' })}>
              К списку заметок
            </Button>
          }
        />
        <BottomNavBar />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: token.colorBgLayout, position: 'relative' }}>
      <PageBackground opacity={0.04} />

      <AppHeader showSearch={false} />

      <div
        style={{
          maxWidth: 1600,
          margin: '0 auto',
          padding: isMobile ? '16px 16px 100px' : '28px 32px 48px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Breadcrumb */}
        <div style={{ marginBottom: 16 }}>
          <Text
            style={{ color: token.colorTextSecondary, fontSize: 14, cursor: 'pointer' }}
            onClick={() => navigate({ to: '/notes' })}
          >
            Заметки
          </Text>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, margin: '0 8px' }}>{'>'}</Text>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14 }}>Просмотр заметки</Text>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, margin: '0 8px' }}>{'>'}</Text>
          <Text strong style={{ fontSize: 14 }}>
            {note.title}
          </Text>
        </div>

        {/* Заголовок + кнопки */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <EditOutlined style={{ fontSize: 20, color: token.colorTextSecondary }} />
            <Title level={3} style={{ margin: 0, textTransform: 'uppercase' }}>
              {note.title}
            </Title>
          </div>

          <Button
            icon={<ExportOutlined />}
            onClick={() => {
              exportNote(note);
              message.success('Заметка экспортирована');
            }}
            style={{ borderRadius: 8 }}
          >
            Экспорт
          </Button>
        </div>

        <Button
          onClick={() => navigate({ to: '/notes/$id/edit', params: { id: note.id } })}
          style={{
            borderRadius: 8,
            marginBottom: 32,
            background: token.colorFillSecondary,
            color: token.colorText,
            border: 'none',
          }}
        >
          Редактировать заметку
        </Button>

        {/* Контент с оглавлением */}
        <Row gutter={32}>
          {/* Оглавление (sidebar) */}
          {toc.length > 0 && (
            <Col xs={24} md={6}>
              <div
                style={{
                  position: 'sticky',
                  top: 100,
                  padding: '16px 0',
                }}
              >
                <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>
                  Структура заметки
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {toc.map((entry) => (
                    <Text
                      key={entry.id}
                      style={{
                        fontSize: 13,
                        color: token.colorTextSecondary,
                        paddingLeft: (entry.level - 1) * 16,
                        cursor: 'default',
                        lineHeight: 1.6,
                        fontWeight: entry.level <= 2 ? 500 : 400,
                      }}
                    >
                      {entry.text}
                    </Text>
                  ))}
                </div>
              </div>
            </Col>
          )}

          {/* Основной контент */}
          <Col xs={24} md={toc.length > 0 ? 18 : 24}>
            <div
              style={{
                background: token.colorBgContainer,
                borderRadius: 12,
                padding: '32px 40px',
                minHeight: 400,
              }}
            >
              <Paragraph
                style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  color: token.colorText,
                }}
              >
                {renderedContent}
              </Paragraph>
            </div>
          </Col>
        </Row>
      </div>

      <BottomNavBar />
    </div>
  );
}
