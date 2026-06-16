import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Button, Card, Empty, FloatButton, Flex, Masonry, Pagination, Result, Spin, Typography, theme } from 'antd';
import { BookOutlined, FileTextOutlined, MessageOutlined, ReadOutlined } from '@ant-design/icons';
import { AppHeader } from '@/components/common/AppHeader';
import { BookmarkRibbon } from '@/components/common/BookmarkRibbon';
import { BottomNavBar } from '@/components/common/BottomNavBar';
import { DocumentCard } from '@/components/common/DocumentCard';
import { MobileFilterTabs } from '@/components/common/MobileFilterTabs';
import { PageBackground } from '@/components/common/PageBackground';
import { QuoteBookmarkCard } from '@/components/common/QuoteBookmarkCard';
import { useNavigate } from '@tanstack/react-router';
import { bookmarkService } from '@/services/bookmark.service';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { BookmarkItem, BookmarkKind, QuoteBookmark } from '@/types/bookmark';
import type { Document } from '@/types/document';

const { Title, Text } = Typography;

const PAGE_SIZE = 16;

const BOOKMARK_FILTERS = [
  { key: 'all', label: 'Все' },
  { key: 'publications', label: 'Публикации' },
  { key: 'quotes', label: 'Цитаты' },
] as const;

type BookmarkFilterKey = (typeof BOOKMARK_FILTERS)[number]['key'];

function mapFilterToKind(filter: BookmarkFilterKey): BookmarkKind | undefined {
  if (filter === 'publications') {
    return 'publication';
  }

  if (filter === 'quotes') {
    return 'quote';
  }

  return undefined;
}

function estimatePublicationCardHeight(doc: Document): number {
  const base = 180;
  const descLen = doc.description?.length ?? 0;
  const tagsHeight = doc.tags.length > 0 ? 38 : 0;
  const descHeight = Math.min(Math.ceil(descLen / 52) * 22, 92);
  const coverHeight = doc.cover_url ? 172 : 0;

  return base + tagsHeight + descHeight + coverHeight;
}

/** Высота компактной горизонтальной карточки публикации (мобильная вёрстка) */
function estimateMobilePublicationCardHeight(doc: Document): number {
  const headerH = 28 + 8;
  const titleLines = Math.min(4, Math.max(1, Math.ceil((doc.title?.length ?? 0) / 18)));
  const contentH = Math.max(titleLines * 21, doc.cover_url ? 130 : 0);
  const tagsH = doc.tags.length > 0 ? 12 + 24 : 0;
  const bodyPadding = 28;
  return headerH + contentH + tagsH + bodyPadding;
}

function estimateQuoteCardHeight(bookmark: QuoteBookmark): number {
  const quoteHeight = Math.min(Math.ceil(bookmark.quote_text.length / 38) * 24, 240);
  const contextHeight = bookmark.context ? Math.min(Math.ceil(bookmark.context.length / 48) * 20, 96) : 0;

  return 250 + quoteHeight + contextHeight;
}

function getEmptyDescription(filter: BookmarkFilterKey) {
  switch (filter) {
    case 'publications':
      return 'Сохранённых публикаций пока нет';
    case 'quotes':
      return 'Сохранённых цитат пока нет';
    default:
      return 'Закладки пока пусты';
  }
}

function getBookmarkErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Не удалось загрузить закладки. Попробуйте ещё раз.';
  }

  return 'Не удалось загрузить закладки. Попробуйте ещё раз.';
}

export function BookmarksPage() {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<BookmarkFilterKey>('all');
  const requestIdRef = useRef(0);

  const { token } = theme.useToken();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const fetchBookmarks = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await bookmarkService.getAll({
        page,
        limit: PAGE_SIZE,
        search: submittedSearch || undefined,
        kind: mapFilterToKind(activeFilter),
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setItems(result.items);
      setTotal(result.total);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setItems([]);
      setTotal(0);
      setErrorMessage(getBookmarkErrorMessage(error));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [activeFilter, page, submittedSearch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setSubmittedSearch(search.trim());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const masonryItems = useMemo<Array<{ key: string; height: number; data: BookmarkItem; children: React.ReactNode }>>(
    () =>
      items.map((bookmark) => {
        if (bookmark.kind === 'publication') {
          return {
            key: bookmark.id,
            height: isMobile
              ? estimateMobilePublicationCardHeight(bookmark.document)
              : estimatePublicationCardHeight(bookmark.document),
            data: bookmark,
            children: (
              <div
                style={{
                  position: 'relative',
                  contentVisibility: 'auto',
                  containIntrinsicSize: '420px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: 18,
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}
                >
                  <BookmarkRibbon />
                </div>
                <DocumentCard doc={bookmark.document} />
              </div>
            ),
          };
        }

        return {
          key: bookmark.id,
          height: estimateQuoteCardHeight(bookmark),
          data: bookmark,
          children: <QuoteBookmarkCard bookmark={bookmark} />,
        };
      }),
    [items, isMobile]
  );

  const publicationCount = items.filter((bookmark) => bookmark.kind === 'publication').length;
  const quoteCount = items.filter((bookmark) => bookmark.kind === 'quote').length;

  return (
    <div style={{ minHeight: '100vh', background: token.colorBgLayout, position: 'relative' }}>
      <PageBackground opacity={0.04} />

      <AppHeader
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => {
          setPage(1);
          setSubmittedSearch(search.trim());
        }}
      />

      <div
        style={{
          maxWidth: 1600,
          margin: '0 auto',
          padding: isMobile ? '12px 16px 100px' : '28px 32px 48px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Закладки
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Сохранённые публикации и цитаты для быстрого возврата к важным материалам.
          </Text>
        </div>

        {isMobile ? (
          <MobileFilterTabs
            tabs={BOOKMARK_FILTERS.map((filter) => ({ key: filter.key, label: filter.label }))}
            activeKey={activeFilter}
            onChange={(key) => {
              setActiveFilter(key as BookmarkFilterKey);
              setPage(1);
            }}
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: 6,
                borderRadius: 999,
                background: token.colorBgContainer,
                boxShadow: token.boxShadowSecondary,
              }}
            >
              {BOOKMARK_FILTERS.map((filter) => {
                const isActive = activeFilter === filter.key;

                return (
                  <Button
                    key={filter.key}
                    type="text"
                    onClick={() => {
                      setActiveFilter(filter.key);
                      setPage(1);
                    }}
                    style={{
                      height: 40,
                      paddingInline: 18,
                      borderRadius: 999,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? token.colorPrimary : token.colorTextSecondary,
                      background: isActive ? `${token.colorPrimary}12` : 'transparent',
                    }}
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {!isMobile && (
          <Flex gap={16} wrap style={{ marginBottom: 24 }}>
            <Card
              style={{
                flex: '1 1 260px',
                borderRadius: 18,
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
              }}
            >
              <Flex align="center" gap={12}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    display: 'grid',
                    placeItems: 'center',
                    background: `${token.colorPrimary}12`,
                    color: token.colorPrimary,
                    fontSize: 18,
                  }}
                >
                  <BookOutlined />
                </div>
                <div>
                  <Text type="secondary">Найдено материалов</Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {total}
                  </Title>
                </div>
              </Flex>
            </Card>

            <Card
              style={{
                flex: '1 1 260px',
                borderRadius: 18,
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
              }}
            >
              <Flex align="center" gap={12}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    display: 'grid',
                    placeItems: 'center',
                    background: token.colorFillSecondary,
                    color: token.colorText,
                    fontSize: 18,
                  }}
                >
                  {activeFilter === 'quotes' ? <FileTextOutlined /> : <ReadOutlined />}
                </div>
                <div>
                  <Text type="secondary">На этой странице</Text>
                  <Title level={4} style={{ margin: 0 }}>
                    {activeFilter === 'quotes'
                      ? `${quoteCount} цитат`
                      : activeFilter === 'publications'
                        ? `${publicationCount} публикаций`
                        : `${publicationCount} публикаций и ${quoteCount} цитат`}
                  </Title>
                </div>
              </Flex>
            </Card>
          </Flex>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
            <Spin size="large" />
          </div>
        ) : errorMessage ? (
          <Result
            status="error"
            title="Не удалось загрузить закладки"
            subTitle={errorMessage}
            extra={
              <Button type="primary" onClick={() => void fetchBookmarks()}>
                Повторить
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <Empty description={getEmptyDescription(activeFilter)} style={{ paddingTop: 80 }} />
        ) : (
          <>
            <div style={{ contentVisibility: 'auto', containIntrinsicSize: '900px' }}>
              <Masonry items={masonryItems} columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gutter={16} fresh />
            </div>

            {total > PAGE_SIZE && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
                <Pagination
                  current={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  onChange={setPage}
                  showSizeChanger={false}
                  showTotal={(currentTotal) => `Всего ${currentTotal} закладок`}
                />
              </div>
            )}
          </>
        )}
      </div>

      {!isMobile && (
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined />}
          size="large"
          onClick={() => navigate({ to: '/chat' })}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            boxShadow: token.boxShadowSecondary,
            zIndex: 200,
          }}
        />
      )}

      {isMobile && <FloatButton.BackTop style={{ bottom: 100, right: 16 }} />}

      <BottomNavBar />
    </div>
  );
}


