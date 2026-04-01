import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Typography, Tag, Breadcrumb, Spin, Button, Divider, Flex, message, theme } from 'antd';
import { CalendarOutlined, UserOutlined, ArrowLeftOutlined, BookOutlined } from '@ant-design/icons';
import { Link, useParams } from '@tanstack/react-router';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { bookmarkService } from '@/services/bookmark.service';
import { documentService } from '@/services/document.service';
import type { Document } from '@/types/document';
import { AppLayout } from '@/layouts/AppLayout';

const { Title, Text, Paragraph } = Typography;

const MIN_BOOKMARK_SELECTION_LENGTH = 3;
const MAX_BOOKMARK_SELECTION_LENGTH = 4000;
const MAX_CONTEXT_LENGTH = 280;
const MAX_PREVIEW_LENGTH = 140;

type SelectionDraft = {
  quoteText: string;
  context?: string;
  pageLabel?: string;
  top: number;
  left: number;
  placement: 'top' | 'bottom';
  isTooLong: boolean;
};

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function getElementFromNode(node: Node | null) {
  if (!node) {
    return null;
  }

  return node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
}

function isRangeInsideContainer(range: Range, container: HTMLElement) {
  const startElement = getElementFromNode(range.startContainer);
  const endElement = getElementFromNode(range.endContainer);

  return Boolean(startElement && endElement && container.contains(startElement) && container.contains(endElement));
}

function findNearestBlock(element: Element | null, container: HTMLElement) {
  let current = element;

  while (current && current !== container) {
    if (current.matches('p, li, blockquote, td, th, pre, h1, h2, h3, h4, h5, h6')) {
      return current;
    }

    current = current.parentElement;
  }

  return container;
}

function buildContextSnippet(blockText: string, quoteText: string) {
  if (!blockText) {
    return undefined;
  }

  const normalizedBlock = normalizeText(blockText);
  if (!normalizedBlock || normalizedBlock === quoteText) {
    return undefined;
  }

  const normalizedQuote = quoteText.toLowerCase();
  const startIndex = normalizedBlock.toLowerCase().indexOf(normalizedQuote);
  if (startIndex === -1) {
    return truncateText(normalizedBlock, MAX_CONTEXT_LENGTH);
  }

  const contextPadding = Math.max(40, Math.floor((MAX_CONTEXT_LENGTH - quoteText.length) / 2));
  const snippetStart = Math.max(0, startIndex - contextPadding);
  const snippetEnd = Math.min(normalizedBlock.length, startIndex + quoteText.length + contextPadding);
  const prefix = snippetStart > 0 ? '…' : '';
  const suffix = snippetEnd < normalizedBlock.length ? '…' : '';

  return `${prefix}${normalizedBlock.slice(snippetStart, snippetEnd).trim()}${suffix}`;
}

function findPageLabel(element: Element | null, container: HTMLElement) {
  if (!element) {
    return undefined;
  }

  const pageLabelPattern = /(?:стр\.?|page)\s*(\d{1,4})/i;
  const nearestBlock = findNearestBlock(element, container);
  const nearbyTexts = [nearestBlock.textContent ?? ''];
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));

  for (const heading of headings) {
    if (heading === nearestBlock || Boolean(heading.compareDocumentPosition(nearestBlock) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      nearbyTexts.push(heading.textContent ?? '');
    }
  }

  for (const text of nearbyTexts) {
    const match = normalizeText(text).match(pageLabelPattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return undefined;
}

function getSelectionDraft(range: Range, container: HTMLElement): SelectionDraft | null {
  if (!isRangeInsideContainer(range, container)) {
    return null;
  }

  const quoteText = normalizeText(range.toString());
  if (quoteText.length < MIN_BOOKMARK_SELECTION_LENGTH) {
    return null;
  }

  const rect = range.getBoundingClientRect();
  const referenceRect = rect.width || rect.height ? rect : range.getClientRects()[0];
  if (!referenceRect) {
    return null;
  }

  const anchorElement = getElementFromNode(range.startContainer);
  const nearestBlock = findNearestBlock(anchorElement, container);
  const context = buildContextSnippet(nearestBlock.textContent ?? '', quoteText);
  const pageLabel = findPageLabel(anchorElement, container);
  const placement: SelectionDraft['placement'] = referenceRect.top > 160 ? 'top' : 'bottom';
  const popoverHalfWidth = Math.max(72, Math.min(160, (window.innerWidth - 24) / 2));
  const preferredTop = placement === 'top' ? referenceRect.top - 16 : referenceRect.bottom + 16;

  return {
    quoteText,
    context,
    pageLabel,
    top: clamp(preferredTop, 88, window.innerHeight - 24),
    left: clamp(referenceRect.left + referenceRect.width / 2, popoverHalfWidth + 12, window.innerWidth - popoverHalfWidth - 12),
    placement,
    isTooLong: quoteText.length > MAX_BOOKMARK_SELECTION_LENGTH,
  };
}

function getBookmarkSaveErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Не удалось сохранить закладку. Попробуйте ещё раз.';
  }

  return 'Не удалось сохранить закладку. Попробуйте ещё раз.';
}

export function DocumentViewPage() {
  const { id } = useParams({ from: '/documents/$id' });
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectionDraft, setSelectionDraft] = useState<SelectionDraft | null>(null);
  const [savingSelection, setSavingSelection] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { token } = theme.useToken();

  const clearSelectionDraft = useCallback((clearNativeSelection = false) => {
    setSelectionDraft(null);

    if (clearNativeSelection) {
      window.getSelection()?.removeAllRanges();
    }
  }, []);

  const refreshSelectionDraft = useCallback(() => {
    const container = contentRef.current;
    const selection = window.getSelection();

    if (!container || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setSelectionDraft(null);
      return;
    }

    const nextDraft = getSelectionDraft(selection.getRangeAt(0), container);
    setSelectionDraft(nextDraft);
  }, []);

  const handleSaveSelection = useCallback(async () => {
    if (!currentDocument || !selectionDraft || savingSelection || selectionDraft.isTooLong) {
      return;
    }

    setSavingSelection(true);

    try {
      await bookmarkService.create({
        documentId: currentDocument.id,
        kind: 'quote',
        quoteText: selectionDraft.quoteText,
        context: selectionDraft.context,
        pageLabel: selectionDraft.pageLabel,
      });

      message.success('Цитата сохранена в закладки');
      clearSelectionDraft(true);
    } catch (error) {
      message.error(getBookmarkSaveErrorMessage(error));
    } finally {
      setSavingSelection(false);
    }
  }, [clearSelectionDraft, currentDocument, savingSelection, selectionDraft]);

  useEffect(() => {
    setLoading(true);
    setCurrentDocument(null);
    documentService
      .getById(id)
      .then(setCurrentDocument)
      .catch(() => setCurrentDocument(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    clearSelectionDraft(true);
  }, [clearSelectionDraft, currentDocument?.id]);

  useEffect(() => {
    if (!currentDocument?.content) {
      return undefined;
    }

    const handleSelectionChange = () => {
      refreshSelectionDraft();
    };

    const handleViewportChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return;
      }

      refreshSelectionDraft();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSelectionDraft(true);
      }
    };

    globalThis.document.addEventListener('selectionchange', handleSelectionChange);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      globalThis.document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [clearSelectionDraft, currentDocument?.content, refreshSelectionDraft]);

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <Spin size="large" />
        </div>
      </AppLayout>
    );
  }

  if (!currentDocument) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
          <Title level={4} type="secondary">
            Документ не найден
          </Title>
          <Link to="/catalog">
            <Button type="primary" style={{ marginTop: 16 }}>
              Вернуться в каталог
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          { title: <Link to="/catalog">Каталог</Link> },
          { title: currentDocument.title },
        ]}
      />

      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Hero обложка */}
        {currentDocument.cover_url && (
          <div
            style={{
              width: '100%',
              height: 320,
              borderRadius: 16,
              overflow: 'hidden',
              marginBottom: 32,
            }}
          >
            <img
              src={currentDocument.cover_url}
              alt={currentDocument.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}
        {/* Мета */}
        <div style={{ marginBottom: 12 }}>
          <Tag color="blue">{currentDocument.category.title}</Tag>
        </div>

        <Title level={2} style={{ marginBottom: 16 }}>
          {currentDocument.title}
        </Title>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
          <Text type="secondary">
            <UserOutlined style={{ marginRight: 6 }} />
            {currentDocument.author.name}
          </Text>
          <span style={{ color: '#d9d9d9' }}>|</span>
          <Text type="secondary">
            <CalendarOutlined style={{ marginRight: 6 }} />
            {dayjs(currentDocument.publication_date).format('D MMMM YYYY')}
          </Text>
        </div>

        {currentDocument.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {currentDocument.tags.map((tag) => (
              <Tag key={tag.id}>{tag.title}</Tag>
            ))}
          </div>
        )}

        <Divider />

        {/* Описание */}
        {currentDocument.description && (
          <Paragraph
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: token.colorTextSecondary,
              marginBottom: 32,
            }}
          >
            {currentDocument.description}
          </Paragraph>
        )}

        {/* Контент */}
        {currentDocument.content && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '12px 16px',
                marginBottom: 18,
                borderRadius: 14,
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <div>
                <Text strong style={{ display: 'block', marginBottom: 2 }}>
                  Выделяйте важные фрагменты по ходу чтения
                </Text>
                <Text type="secondary">После выделения текста появится действие для сохранения цитаты в закладки.</Text>
              </div>

              {selectionDraft ? (
                <Tag color={selectionDraft.isTooLong ? 'error' : 'blue'} style={{ marginInlineEnd: 0 }}>
                  {selectionDraft.isTooLong
                    ? `Слишком длинный фрагмент: ${selectionDraft.quoteText.length} символов`
                    : `Выделено ${selectionDraft.quoteText.length} символов`}
                </Tag>
              ) : null}
            </div>

            <div ref={contentRef} className="document-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {currentDocument.content}
              </ReactMarkdown>
            </div>

            {selectionDraft ? (
              <div
                className="animate-fade-in"
                onMouseDown={(event) => event.preventDefault()}
                style={{
                  position: 'fixed',
                  top: selectionDraft.top,
                  left: selectionDraft.left,
                  transform: selectionDraft.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
                  width: 320,
                  maxWidth: 'calc(100vw - 24px)',
                  padding: 14,
                  borderRadius: 16,
                  background: token.colorBgElevated,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  boxShadow: token.boxShadowSecondary,
                  zIndex: 1200,
                }}
              >
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
                  Цитата для закладки
                </Text>
                <Text style={{ display: 'block', fontSize: 14, lineHeight: 1.6, marginBottom: 10 }}>
                  “{truncateText(selectionDraft.quoteText, MAX_PREVIEW_LENGTH)}”
                </Text>

                {selectionDraft.context ? (
                  <Text type="secondary" style={{ display: 'block', fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
                    {selectionDraft.context}
                  </Text>
                ) : null}

                {selectionDraft.isTooLong ? (
                  <Text type="danger" style={{ display: 'block', marginBottom: 12 }}>
                    Выделите не больше {MAX_BOOKMARK_SELECTION_LENGTH} символов, чтобы сохранить цитату.
                  </Text>
                ) : null}

                <Flex gap={8} wrap>
                  <Button
                    type="primary"
                    icon={<BookOutlined />}
                    loading={savingSelection}
                    disabled={selectionDraft.isTooLong}
                    onClick={() => void handleSaveSelection()}
                  >
                    В закладки
                  </Button>
                  <Button onClick={() => clearSelectionDraft(true)}>Отмена</Button>
                </Flex>
              </div>
            ) : null}
          </>
        )}

        <Divider />

        <Link to="/catalog">
          <Button icon={<ArrowLeftOutlined />}>Вернуться в каталог</Button>
        </Link>
      </div>
    </AppLayout>
  );
}

