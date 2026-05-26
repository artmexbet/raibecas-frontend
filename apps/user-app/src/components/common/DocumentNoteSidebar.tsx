import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Typography, theme } from 'antd';
import { EditOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { noteService } from '@/services/note.service';
import type { NoteItem } from '@/types/note';

const { Text, Paragraph } = Typography;

const STICKER_WIDTH = 220;
const STICKER_MIN_HEIGHT = 120;
const STICKER_GAP = 16;
const OVERLAP_THRESHOLD = STICKER_MIN_HEIGHT + STICKER_GAP;

interface StickerGroup {
  topPx: number;
  notes: NoteItem[];
}

/** Извлекает plain-text превью из EditorJS JSON или обычного текста. */
function extractPreview(content: string, maxLength = 100): string {
  const trimmed = content.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed?.blocks)) {
        const texts = parsed.blocks
          .filter((b: { type: string }) => b.type === 'paragraph' || b.type === 'header')
          .map((b: { data?: { text?: string } }) => (b.data?.text ?? '').replace(/<[^>]+>/g, ''));
        const joined = texts.join(' ');
        return joined.length > maxLength ? `${joined.slice(0, maxLength)}…` : joined;
      }
    } catch {
      // not JSON
    }
  }

  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}…` : trimmed;
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Ищет текстовый якорь в DOM-контейнере и возвращает offsetTop найденного элемента.
 * Использует TreeWalker для обхода текстовых узлов.
 */
function findTextAnchorPosition(container: HTMLElement, anchor: string): number | null {
  if (!anchor || !container) return null;

  const normalizedAnchor = anchor.toLowerCase().replace(/\s+/g, ' ').trim();
  if (normalizedAnchor.length < 3) return null;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  let accumulatedText = '';
  const nodeMap: Array<{ node: Node; startIdx: number }> = [];

  while ((node = walker.nextNode())) {
    const text = node.textContent ?? '';
    nodeMap.push({ node, startIdx: accumulatedText.length });
    accumulatedText += text;
  }

  const normalizedFull = accumulatedText.toLowerCase().replace(/\s+/g, ' ');
  const matchIdx = normalizedFull.indexOf(normalizedAnchor);
  if (matchIdx === -1) return null;

  // Найдём DOM-узел, содержащий начало совпадения
  for (let i = nodeMap.length - 1; i >= 0; i--) {
    if (nodeMap[i]!.startIdx <= matchIdx) {
      const element = nodeMap[i]!.node.parentElement;
      if (element) {
        // Вычисляем offsetTop относительно контейнера
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        return elementRect.top - containerRect.top + container.scrollTop;
      }
      break;
    }
  }

  return null;
}

/**
 * Распределяет заметки по вертикальным позициям и группирует близкие.
 * Заметки с текстовым якорем position_in_document ищутся в DOM.
 * Остальные распределяются равномерно.
 */
function buildStickerGroups(
  notes: NoteItem[],
  container: HTMLElement | null,
  containerHeight: number,
): StickerGroup[] {
  if (notes.length === 0) return [];

  const effectiveHeight = Math.max(containerHeight, 600);
  const positioned: Array<{ note: NoteItem; top: number }> = [];
  const unpositioned: NoteItem[] = [];

  for (const note of notes) {
    if (note.position_in_document && container) {
      const top = findTextAnchorPosition(container, note.position_in_document);
      if (top !== null) {
        positioned.push({ note, top });
        continue;
      }
    }
    unpositioned.push(note);
  }

  // Распределяем заметки без позиции равномерно
  const step = effectiveHeight / (unpositioned.length + 1);
  for (let i = 0; i < unpositioned.length; i++) {
    positioned.push({ note: unpositioned[i]!, top: Math.round(step * (i + 1)) });
  }

  positioned.sort((a, b) => a.top - b.top);

  // Группируем близкие заметки
  const groups: StickerGroup[] = [];
  for (const item of positioned) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && Math.abs(item.top - lastGroup.topPx) < OVERLAP_THRESHOLD) {
      lastGroup.notes.push(item.note);
    } else {
      groups.push({ topPx: item.top, notes: [item.note] });
    }
  }

  return groups;
}

function NoteStickerCard({ group }: { group: StickerGroup }) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = group.notes.length > 1;
  const note = group.notes[activeIndex]!;

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + group.notes.length) % group.notes.length);
  }, [group.notes.length]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % group.notes.length);
  }, [group.notes.length]);

  const preview = extractPreview(note.content);

  return (
    <div
      onClick={() => navigate({ to: '/notes/$id', params: { id: note.id } })}
      style={{
        width: STICKER_WIDTH,
        padding: '12px 14px 10px',
        borderRadius: 10,
        background: token.colorBgElevated,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateX(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      {/* Заголовок */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
        <EditOutlined style={{ fontSize: 11, color: token.colorTextQuaternary, flexShrink: 0 }} />
        <Text
          strong
          style={{
            fontSize: 11,
            lineHeight: 1.3,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: token.colorTextSecondary,
          }}
        >
          {note.title}
        </Text>
        {hasMultiple && (
          <Badge
            count={group.notes.length}
            size="small"
            style={{
              backgroundColor: token.colorFillSecondary,
              color: token.colorText,
              fontSize: 9,
              boxShadow: 'none',
            }}
          />
        )}
      </div>

      {/* Превью */}
      <Paragraph
        style={{
          fontSize: 10,
          lineHeight: 1.45,
          color: token.colorTextTertiary,
          margin: 0,
          maxHeight: 58,
          overflow: 'hidden',
        }}
        ellipsis={{ rows: 4 }}
      >
        {preview}
      </Paragraph>

      {/* Дата + навигация */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
        <Text style={{ fontSize: 9, color: token.colorTextQuaternary }}>
          {formatShortDate(note.created_at)}
        </Text>

        {hasMultiple && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button
              onClick={handlePrev}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '1px 3px',
                borderRadius: 3,
                color: token.colorTextSecondary,
                fontSize: 9,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <LeftOutlined style={{ fontSize: 8 }} />
            </button>
            <Text style={{ fontSize: 9, color: token.colorTextQuaternary }}>
              {activeIndex + 1}/{group.notes.length}
            </Text>
            <button
              onClick={handleNext}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '1px 3px',
                borderRadius: 3,
                color: token.colorTextSecondary,
                fontSize: 9,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RightOutlined style={{ fontSize: 8 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface DocumentNoteSidebarProps {
  documentId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export function DocumentNoteSidebar({ documentId, contentRef }: DocumentNoteSidebarProps) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [renderKey, setRenderKey] = useState(0);

  // Загружаем заметки для документа
  useEffect(() => {
    noteService
      .getAll({ document_id: documentId, limit: 50 })
      .then((result) => setNotes(result.items))
      .catch(() => setNotes([]));
  }, [documentId]);

  // Отслеживаем размеры контента и пересчитываем позиции
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const updateMetrics = () => {
      setContainerHeight(container.scrollHeight);
      // Пересчитываем позиции при изменении размера
      setRenderKey((k) => k + 1);
    };

    const observer = new ResizeObserver(() => updateMetrics());
    observer.observe(container);
    updateMetrics();

    // Пересчитываем после полной загрузки контента (шрифты, изображения)
    const timer = setTimeout(updateMetrics, 500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [contentRef, notes]);

  const groups = useMemo(
    () => buildStickerGroups(notes, contentRef.current, containerHeight),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notes, containerHeight, renderKey],
  );

  if (notes.length === 0) return null;

  // Скрываем стикеры если не хватает места справа
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const container = contentRef.current;
  if (container) {
    const rect = container.getBoundingClientRect();
    if (viewportWidth - rect.right < 260) return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '100%',
        marginLeft: 20,
        width: STICKER_WIDTH,
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {groups.map((group, idx) => (
        <div
          key={`group-${idx}`}
          style={{
            position: 'absolute',
            top: Math.max(0, group.topPx),
            left: 0,
            pointerEvents: 'auto',
          }}
        >
          <NoteStickerCard group={group} />
        </div>
      ))}
    </div>
  );
}
