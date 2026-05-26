import React from 'react';
import { Card, Typography, theme } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import type { NoteItem } from '@/types/note';

const { Title, Paragraph, Text } = Typography;

interface NoteCardProps {
  note: NoteItem;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Извлекает plain-text превью из EditorJS JSON или обычного текста. */
function extractPreview(content: string, maxLength = 200): string {
  const trimmed = content.trim();
  if (!trimmed) return '';

  // Попытка распарсить EditorJS JSON
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed?.blocks)) {
        const texts = parsed.blocks
          .filter((b: { type: string }) => b.type === 'paragraph' || b.type === 'header')
          .map((b: { data?: { text?: string } }) => {
            const raw = b.data?.text ?? '';
            // Убираем HTML-теги
            return raw.replace(/<[^>]+>/g, '');
          });
        const joined = texts.join(' ');
        return joined.length > maxLength ? `${joined.slice(0, maxLength)}…` : joined;
      }
    } catch {
      // Не JSON — используем как plain text
    }
  }

  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}…` : trimmed;
}

export function NoteCard({ note }: NoteCardProps) {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const preview = extractPreview(note.content);

  return (
    <Card
      hoverable
      onClick={() => navigate({ to: '/notes/$id', params: { id: note.id } })}
      style={{
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        body: {
          padding: '20px 24px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <Title
          level={5}
          style={{
            margin: 0,
            color: token.colorTextSecondary,
            fontWeight: 500,
            flex: 1,
          }}
          ellipsis={{ rows: 2 }}
        >
          {note.title}
        </Title>
        <EditOutlined
          style={{
            fontSize: 18,
            color: token.colorTextQuaternary,
            marginLeft: 8,
            flexShrink: 0,
            marginTop: 2,
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: '/notes/$id/edit', params: { id: note.id } });
          }}
        />
      </div>

      <Paragraph
        style={{
          color: token.colorTextSecondary,
          fontSize: 13,
          lineHeight: 1.6,
          margin: 0,
          flex: 1,
        }}
        ellipsis={{ rows: 8 }}
      >
        {preview}
      </Paragraph>

      <Text
        style={{
          color: token.colorTextQuaternary,
          fontSize: 12,
          marginTop: 12,
        }}
      >
        {formatDate(note.created_at)}
      </Text>
    </Card>
  );
}
