import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Empty, Flex, Masonry, Pagination, Spin, Typography, message, theme } from 'antd';
import { BookOutlined, FileTextOutlined, MessageOutlined, ReadOutlined } from '@ant-design/icons';
import { AppHeader } from '@/components/common/AppHeader';
import { BookmarkRibbon } from '@/components/common/BookmarkRibbon';
import { DocumentCard } from '@/components/common/DocumentCard';
import { PageBackground } from '@/components/common/PageBackground';
import { QuoteBookmarkCard } from '@/components/common/QuoteBookmarkCard';
import { bookmarkService } from '@/services/bookmark.service';
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

export function BookmarksPage() {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<BookmarkFilterKey>('all');

  const { token } = theme.useToken();

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);

    try {
      const result = await bookmarkService.getAll({
        page,
        limit: PAGE_SIZE,
        search: submittedSearch || undefined,
        kind: mapFilterToKind(activeFilter),
      });

      setItems(result.items);
      setTotal(result.total);
    } catch {
      setItems([]);
      setTotal(0);
      message.error('Не удалось загрузить закладки');
    } finally {
      setLoading(false);
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
            height: estimatePublicationCardHeight(bookmark.document),
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
    [items]
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
          padding: '28px 32px 48px',
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

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
            <Spin size="large" />
          </div>
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

      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        size="large"
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
    </div>
  );
}


