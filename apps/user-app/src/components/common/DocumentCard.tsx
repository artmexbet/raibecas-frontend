import React from 'react';
import { Card, Tag, Typography, theme } from 'antd';
import { CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import type { Document } from '@/types/document';
import { getParticipantsLabel } from '@/utils/participants';
import { useIsMobile } from '@/hooks/useIsMobile';
import { BookmarkToggleIcon } from './BookmarkToggleIcon';

const { Title, Text } = Typography;

interface DocumentCardProps {
  doc: Document;
  /** Whether this document is bookmarked by the current user. */
  isBookmarked?: boolean;
  /** Called when the user clicks the bookmark toggle icon. */
  onBookmarkToggle?: (docId: string) => void;
  /** Whether a bookmark toggle operation is in progress. */
  bookmarkLoading?: boolean;
}

export function DocumentCard({ doc, isBookmarked, onBookmarkToggle, bookmarkLoading }: DocumentCardProps) {
  const { token } = theme.useToken();
  const isMobile = useIsMobile();
  const showBookmarkIcon = onBookmarkToggle !== undefined;

  const bookmarkToggle = showBookmarkIcon && (
    <BookmarkToggleIcon
      bookmarked={Boolean(isBookmarked)}
      onToggle={() => onBookmarkToggle(doc.id)}
      loading={bookmarkLoading}
      size={42}
      style={{
        position: 'absolute',
        top: -6,
        right: 16,
        zIndex: 3,
        filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.18))',
      }}
    />
  );

  if (isMobile) {
    return (
      <Link to="/documents/$id" params={{ id: doc.id }} style={{ display: 'block' }}>
        <div style={{ position: 'relative' }}>
        {bookmarkToggle}
        <Card
          hoverable
          size="small"
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            position: 'relative',
          }}
          styles={{ body: { padding: 12 } }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
            {/* Левая колонка: категория, заголовок, теги */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Tag
                style={{
                  margin: 0,
                  alignSelf: 'flex-start',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  background: `${token.colorPrimary}14`,
                  color: token.colorPrimary,
                  border: `1px solid ${token.colorPrimary}30`,
                }}
              >
                {doc.category.title}
              </Tag>

              <Title
                level={5}
                style={{
                  margin: 0,
                  lineHeight: 1.4,
                  fontSize: 15,
                  fontWeight: 600,
                  color: token.colorText,
                }}
                ellipsis={{ rows: 3 }}
              >
                {doc.title}
              </Title>

              {doc.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                  {doc.tags.slice(0, 3).map((tag) => (
                    <Tag
                      key={tag.id}
                      style={{
                        margin: 0,
                        fontSize: 11,
                        borderRadius: 6,
                        background: token.colorFill,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        color: token.colorTextSecondary,
                      }}
                    >
                      {tag.title}
                    </Tag>
                  ))}
                  {doc.tags.length > 3 && (
                    <Tag
                      style={{
                        margin: 0,
                        fontSize: 11,
                        borderRadius: 6,
                        color: token.colorTextTertiary,
                        background: 'transparent',
                        border: 'none',
                      }}
                    >
                      +{doc.tags.length - 3}
                    </Tag>
                  )}
                </div>
              )}
            </div>

            {/* Год — слева от обложки */}
            <div style={{ display: 'flex', alignItems: 'flex-end', flexShrink: 0 }}>
              <Text strong style={{ fontSize: 22, lineHeight: 1, color: token.colorTextSecondary }}>
                {dayjs(doc.publication_date).format("'YY")}
              </Text>
            </div>

            {/* Обложка — почти во всю высоту карточки */}
            {doc.cover_url ? (
              <div style={{ width: 104, minHeight: 170, alignSelf: 'stretch', flexShrink: 0, borderRadius: 10, overflow: 'hidden' }}>
                <img
                  src={doc.cover_url}
                  alt={doc.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ) : null}
          </div>
        </Card>
        </div>
      </Link>
    );
  }

  return (
    <Link to="/documents/$id" params={{ id: doc.id }} style={{ display: 'block' }}>
      <div style={{ position: 'relative' }}>
      {bookmarkToggle}
      <Card
        hoverable
        size="small"
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          transition: 'box-shadow 0.2s ease, transform 0.15s ease',
          position: 'relative',
        }}
        styles={{ body: { padding: '18px 20px' } }}
      >
        {/* Обложка */}
        {doc.cover_url ? (
          <div
            style={{
              margin: '-18px -20px 16px',
              height: 300,
              overflow: 'hidden',
              borderRadius: '16px 16px 0 0',
            }}
          >
            <img
              src={doc.cover_url}
              alt={doc.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ) : null}
        {/* Категория + год (в правом верхнем углу) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 12, paddingRight: showBookmarkIcon && !doc.cover_url ? 44 : 0 }}>
          <Tag
            style={{
              margin: 0,
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              background: `${token.colorPrimary}14`,
              color: token.colorPrimary,
              border: `1px solid ${token.colorPrimary}30`,
            }}
          >
            {doc.category.title}
          </Tag>
          <Text strong style={{ fontSize: 22, lineHeight: 1, color: token.colorTextSecondary, flexShrink: 0 }}>
            {dayjs(doc.publication_date).format("'YY")}
          </Text>
        </div>

        {/* Заголовок */}
        <Title
          level={5}
          style={{
            marginTop: 0,
            marginBottom: 14,
            lineHeight: 1.4,
            fontSize: 15,
            fontWeight: 600,
            color: token.colorText,
          }}
          ellipsis={{ rows: 3 }}
        >
          {doc.title}
        </Title>

        {/* Теги */}
        {doc.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {doc.tags.slice(0, 3).map((tag) => (
              <Tag
                key={tag.id}
                style={{
                  margin: 0,
                  fontSize: 11,
                  borderRadius: 6,
                  background: token.colorFill,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  color: token.colorTextSecondary,
                }}
              >
                {tag.title}
              </Tag>
            ))}
            {doc.tags.length > 3 && (
              <Tag
                style={{
                  margin: 0,
                  fontSize: 11,
                  borderRadius: 6,
                  color: token.colorTextTertiary,
                  background: 'transparent',
                  border: 'none',
                }}
              >
                +{doc.tags.length - 3}
              </Tag>
            )}
          </div>
        )}

        {/* Мета */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 6,
            paddingTop: 12,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            <UserOutlined style={{ marginRight: 5 }} />
            {getParticipantsLabel(doc)}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <CalendarOutlined style={{ marginRight: 5 }} />
            {dayjs(doc.publication_date).format('DD.MM.YYYY')}
          </Text>
        </div>
      </Card>
      </div>
    </Link>
  );
}
