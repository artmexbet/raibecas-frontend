import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Typography, Tag, Breadcrumb, Spin, Button, Divider, Drawer, Flex, message, theme } from 'antd';
import {
  ArrowLeftOutlined,
  BookOutlined,
  EditOutlined,
  MessageOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { bookmarkService } from '@/services/bookmark.service';
import { documentService } from '@/services/document.service';
import type { Document } from '@/types/document';
import { AppLayout } from '@/layouts/AppLayout';
import { DocumentBriefCard } from '@/components/common/DocumentBriefCard';
import { DocumentNoteSidebar } from '@/components/common/DocumentNoteSidebar';
import { InlineDocumentChat } from '@/features/chat/components/InlineDocumentChat';
import type { InlineDocumentChatHandle } from '@/features/chat/components/InlineDocumentChat';
import { useIsMobile } from '@/hooks/useIsMobile';
import './document-view.css';

const { Title, Text } = Typography;

type DocumentViewMode = 'card' | 'reading';

const MIN_BOOKMARK_SELECTION_LENGTH = 3;
const MAX_BOOKMARK_SELECTION_LENGTH = 4000;
const MAX_CONTEXT_LENGTH = 280;
const MAX_PREVIEW_LENGTH = 140;
const HIGHLIGHT_FADE_DELAY_MS = 4000;

/**
 * Finds the first occurrence of `searchText` inside `container` using a TreeWalker,
 * wraps it in a <mark> element with the given className, scrolls to it, and
 * returns a cleanup function that removes the highlight after a delay.
 */
function highlightTextInContainer(
  container: HTMLElement,
  searchText: string,
  className: string,
): (() => void) | null {
  const normalizedSearch = searchText.replace(/\s+/g, ' ').trim().toLowerCase();
  if (!normalizedSearch) {
    return null;
  }

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let accumulated = '';
  const textNodes: { node: Text; start: number; end: number }[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const nodeText = node.textContent ?? '';
    const start = accumulated.length;
    accumulated += nodeText;
    textNodes.push({ node, start, end: accumulated.length });
  }

  const normalizedAccumulated = accumulated.toLowerCase();
  const matchIndex = normalizedAccumulated.indexOf(normalizedSearch);
  if (matchIndex === -1) {
    return null;
  }

  const matchEnd = matchIndex + normalizedSearch.length;

  // Find which text nodes contain the match
  const marks: HTMLElement[] = [];
  for (const { node, start, end } of textNodes) {
    if (end <= matchIndex || start >= matchEnd) {
      continue;
    }

    const overlapStart = Math.max(0, matchIndex - start);
    const overlapEnd = Math.min(node.textContent!.length, matchEnd - start);

    const range = document.createRange();
    range.setStart(node, overlapStart);
    range.setEnd(node, overlapEnd);

    const mark = document.createElement('mark');
    mark.className = className;
    range.surroundContents(mark);
    marks.push(mark);
  }

  if (marks.length > 0) {
    // Scroll to the first mark after a short delay to let layout settle
    const firstMark = marks[0];
    if (firstMark) {
      requestAnimationFrame(() => {
        firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    // Fade out after delay
    const fadeTimeout = window.setTimeout(() => {
      for (const mark of marks) {
        mark.classList.add(`${className}--fading`);
      }
    }, HIGHLIGHT_FADE_DELAY_MS);

    // Cleanup: remove marks and restore original text
    return () => {
      window.clearTimeout(fadeTimeout);
      for (const mark of marks) {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent ?? ''), mark);
          parent.normalize();
        }
      }
    };
  }

  return null;
}

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
  const { highlight } = useSearch({ from: '/documents/$id' });
  const navigate = useNavigate();
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  // Navigating from a bookmark highlight should jump straight to the text.
  const [viewMode, setViewMode] = useState<DocumentViewMode>(highlight ? 'reading' : 'card');
  const [chatVisible, setChatVisible] = useState(true);
  const [selectionDraft, setSelectionDraft] = useState<SelectionDraft | null>(null);
  const [savingSelection, setSavingSelection] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cleanupHighlightRef = useRef<(() => void) | null>(null);
  const inlineChatRef = useRef<InlineDocumentChatHandle>(null);
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

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

  const handleCreateNoteFromSelection = useCallback(async () => {
    if (!currentDocument || !selectionDraft || savingNote || selectionDraft.isTooLong) {
      return;
    }

    setSavingNote(true);

    try {
      // Сохраняем текстовый якорь — первые 80 символов выделенного текста (device-independent)
      const positionInDocument = selectionDraft.quoteText.slice(0, 80);

      // Сначала сохраняем цитату как закладку, чтобы получить bookmark_id
      const bookmarkResult = await bookmarkService.create({
        documentId: currentDocument.id,
        kind: 'quote',
        quoteText: selectionDraft.quoteText,
        context: selectionDraft.context,
        pageLabel: selectionDraft.pageLabel,
      });

      clearSelectionDraft(true);

      // Переходим на создание заметки с привязкой к документу и закладке
      const params = new URLSearchParams({
        documentId: currentDocument.id,
        bookmarkId: bookmarkResult.item.id,
        selectedText: selectionDraft.quoteText,
        positionInDocument,
      });

      navigate({ to: `/notes/create?${params.toString()}` });
    } catch (error) {
      message.error('Не удалось создать закладку для заметки. Попробуйте ещё раз.');
    } finally {
      setSavingNote(false);
    }
  }, [clearSelectionDraft, contentRef, currentDocument, navigate, savingNote, selectionDraft]);

  const handleDiscussInChat = useCallback(() => {
    if (!selectionDraft) {
      return;
    }

    const quoteText = selectionDraft.quoteText;
    setChatVisible(true);
    clearSelectionDraft(true);

    requestAnimationFrame(() => {
      inlineChatRef.current?.appendContext(quoteText);
      document.querySelector('.doc-chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [clearSelectionDraft, selectionDraft]);

  useEffect(() => {
    setLoading(true);
    setCurrentDocument(null);
    setViewMode(highlight ? 'reading' : 'card');
    documentService
      .getById(id)
      .then(setCurrentDocument)
      .catch(() => setCurrentDocument(null))
      .finally(() => setLoading(false));
  }, [highlight, id]);

  // На десктопе чат открыт по умолчанию; на мобильных — скрыт за FAB,
  // чтобы не выезжать поверх контента сразу при входе в чтение.
  useEffect(() => {
    setChatVisible(!isMobile);
  }, [id, isMobile]);

  useEffect(() => {
    clearSelectionDraft(true);
  }, [clearSelectionDraft, currentDocument?.id]);

  // Highlight bookmark quote text when navigating from a bookmark card
  useEffect(() => {
    if (!highlight || !currentDocument?.content || !contentRef.current) {
      return undefined;
    }

    // Wait for ReactMarkdown to render the content
    const timeoutId = window.setTimeout(() => {
      const container = contentRef.current;
      if (!container) {
        return;
      }

      const cleanup = highlightTextInContainer(container, highlight, 'bookmark-highlight');
      if (cleanup) {
        // Store cleanup for when the effect is re-run or component unmounts
        cleanupHighlightRef.current = cleanup;
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      cleanupHighlightRef.current?.();
      cleanupHighlightRef.current = null;
    };
  }, [highlight, currentDocument?.content]);

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
    <AppLayout contentMaxWidth={viewMode === 'reading' ? 1440 : 1100}>
      <Breadcrumb
        style={{ marginBottom: 20, fontSize: isMobile ? 12 : undefined }}
        items={[
          { title: <Link to="/catalog">Каталог работ</Link> },
          { title: currentDocument.documentType?.name ?? currentDocument.category.title },
          { title: currentDocument.title },
        ]}
      />

      {/* Заголовок работы (общий для обоих состояний); на мобильной карточке заголовок
          показывается под обложкой внутри DocumentBriefCard */}
      {!isMobile || viewMode !== 'card' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <ReadOutlined style={{ fontSize: 22, color: token.colorPrimary, flexShrink: 0 }} />
          <Title
            level={isMobile ? 4 : 3}
            style={{ margin: 0, textTransform: 'uppercase', letterSpacing: 0.4, lineHeight: 1.3 }}
          >
            {currentDocument.title}
          </Title>
        </div>
      ) : null}

      {viewMode === 'card' ? (
        /* ── Состояние 1: карточка с краткой информацией ── */
        <DocumentBriefCard doc={currentDocument} onRead={() => setViewMode('reading')} />
      ) : (
        /* ── Состояние 2: чтение текста + встроенный чат ── */
        <>
          <div style={{ marginBottom: isMobile ? 12 : 20 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              size={isMobile ? 'small' : 'middle'}
              onClick={() => setViewMode('card')}
            >
              Вернуться в карточку
            </Button>
          </div>

          <div className={`doc-reading${chatVisible && !isMobile ? '' : ' doc-reading--full'}`}>
            <div className="doc-reading__text" style={{ position: 'relative', overflow: 'visible' }}>
              {/* Стикеры-заметки сбоку */}
              <DocumentNoteSidebar documentId={currentDocument.id} contentRef={contentRef} />

              {currentDocument.content ? (
                <>
                  {!isMobile ? (
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
                        <Text type="secondary">
                          После выделения текста появится действие для сохранения цитаты в закладки.
                        </Text>
                      </div>

                      {selectionDraft ? (
                        <Tag color={selectionDraft.isTooLong ? 'error' : 'blue'} style={{ marginInlineEnd: 0 }}>
                          {selectionDraft.isTooLong
                            ? `Слишком длинный фрагмент: ${selectionDraft.quoteText.length} символов`
                            : `Выделено ${selectionDraft.quoteText.length} символов`}
                        </Tag>
                      ) : null}
                    </div>
                  ) : null}

                  <div ref={contentRef} className="document-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentDocument.content}
                    </ReactMarkdown>
                  </div>

                  {selectionDraft && !isMobile ? (
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
                          disabled={selectionDraft.isTooLong || savingNote}
                          onClick={() => void handleSaveSelection()}
                        >
                          В закладки
                        </Button>
                        <Button
                          icon={<EditOutlined />}
                          loading={savingNote}
                          disabled={selectionDraft.isTooLong || savingSelection}
                          onClick={() => void handleCreateNoteFromSelection()}
                        >
                          Заметка
                        </Button>
                        <Button onClick={() => clearSelectionDraft(true)}>Отмена</Button>
                      </Flex>
                    </div>
                  ) : null}

                  {selectionDraft && isMobile ? (
                    <div
                      className="animate-fade-in"
                      onMouseDown={(event) => event.preventDefault()}
                      style={{
                        position: 'fixed',
                        top: selectionDraft.top,
                        left: selectionDraft.left,
                        transform: selectionDraft.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
                        display: 'flex',
                        alignItems: 'stretch',
                        borderRadius: 999,
                        overflow: 'hidden',
                        background: token.colorBgElevated,
                        boxShadow: token.boxShadowSecondary,
                        zIndex: 1200,
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleDiscussInChat}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          border: 'none',
                          background: 'transparent',
                          padding: '10px 16px',
                          fontSize: 13,
                          color: token.colorText,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <MessageOutlined /> обсудить в чате
                      </button>
                      <div style={{ width: 1, background: token.colorBorderSecondary }} />
                      <button
                        type="button"
                        onClick={() => void handleSaveSelection()}
                        disabled={selectionDraft.isTooLong || savingSelection}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          border: 'none',
                          background: 'transparent',
                          padding: '10px 16px',
                          fontSize: 13,
                          color: selectionDraft.isTooLong ? token.colorTextQuaternary : token.colorText,
                          cursor: selectionDraft.isTooLong ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <BookOutlined /> добавить в закладки
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <Text type="secondary">Текст работы пока недоступен.</Text>
              )}

              <Divider />

              <Link to="/catalog">
                <Button icon={<ArrowLeftOutlined />}>Вернуться в каталог</Button>
              </Link>
            </div>

            {/* На десктопе чат остаётся смонтированным даже когда скрыт — диалог не теряется */}
            {!isMobile ? (
              <InlineDocumentChat
                ref={inlineChatRef}
                documentId={currentDocument.id}
                documentTitle={currentDocument.title}
                hidden={!chatVisible}
                onHide={() => setChatVisible(false)}
              />
            ) : null}
          </div>

          {/* На мобильных чат открывается выезжающей снизу панелью */}
          {isMobile ? (
            <Drawer
              placement="bottom"
              open={chatVisible}
              onClose={() => setChatVisible(false)}
              closable={false}
              size="68%"
              styles={{
                body: { padding: 0, overflow: 'hidden' },
                section: { borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden' },
              }}
            >
              <InlineDocumentChat
                ref={inlineChatRef}
                documentId={currentDocument.id}
                documentTitle={currentDocument.title}
                onHide={() => setChatVisible(false)}
              />
            </Drawer>
          ) : null}
        </>
      )}

      {/* Плавающая кнопка чата: в карточке или когда чат скрыт */}
      {viewMode === 'card' || !chatVisible ? (
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined />}
          size="large"
          aria-label="Открыть чат"
          onClick={() => {
            setViewMode('reading');
            setChatVisible(true);
          }}
          style={{
            position: 'fixed',
            bottom: isMobile ? 92 : 24,
            right: 24,
            width: 56,
            height: 56,
            boxShadow: token.boxShadowSecondary,
            zIndex: 200,
          }}
        />
      ) : null}
    </AppLayout>
  );
}

