import React from 'react';
import { Card, Tag, Typography, theme } from 'antd';
import { BookFilled, BookOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import type { Document } from '@/types/document';
import { getParticipantsLabel } from '@/utils/participants';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Title, Text, Paragraph } = Typography;

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
    <div
      role="button"
      tabIndex={0}
      aria-label={isBookmarked ? 'Убрать из закладок' : 'Добавить в закладки'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!bookmarkLoading) {
          onBookmarkToggle(doc.id);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          if (!bookmarkLoading) {
            onBookmarkToggle(doc.id);
          }
        }
      }}
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 3,
        width: 32,
        height: 32,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 8,
        background: isBookmarked ? `${token.colorPrimary}18` : `${token.colorBgContainer}cc`,
        backdropFilter: 'blur(4px)',
        cursor: bookmarkLoading ? 'wait' : 'pointer',
        transition: 'background 0.2s ease, transform 0.15s ease, opacity 0.2s ease',
        opacity: bookmarkLoading ? 0.6 : 1,
        fontSize: 16,
        color: isBookmarked ? token.colorPrimary : token.colorTextTertiary,
        border: `1px solid ${isBookmarked ? `${token.colorPrimary}30` : token.colorBorderSecondary}`,
      }}
    >
      {isBookmarked ? <BookFilled /> : <BookOutlined />}
    </div>
  );

  if (isMobile) {
    return (
      <Link to="/documents/$id" params={{ id: doc.id }} style={{ display: 'block' }}>
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
          styles={{ body: { padding: '14px 16px' } }}
        >
          {bookmarkToggle}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
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
            <Text strong style={{ fontSize: 16, color: token.colorTextSecondary, flexShrink: 0 }}>
              {dayjs(doc.publication_date).format("'YY")}
            </Text>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Title
              level={5}
              style={{
                flex: 1,
                minWidth: 0,
                margin: 0,
                lineHeight: 1.4,
                fontSize: 15,
                fontWeight: 600,
                color: token.colorText,
              }}
              ellipsis={{ rows: 4 }}
            >
              {doc.title}
            </Title>

            {doc.cover_url ? (
              <div style={{ width: 92, height: 130, flexShrink: 0, borderRadius: 10, overflow: 'hidden' }}>
                <img
                  src={doc.cover_url}
                  alt={doc.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ) : null}
          </div>

          {doc.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {doc.tags.slice(0, 4).map((tag) => (
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
              {doc.tags.length > 4 && (
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
                  +{doc.tags.length - 4}
                </Tag>
              )}
            </div>
          )}
        </Card>
      </Link>
    );
  }

  return (
    <Link to="/documents/$id" params={{ id: doc.id }} style={{ display: 'block' }}>
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
        {/* Bookmark toggle icon */}
        {bookmarkToggle}

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
        {/* Категория */}
        <Tag
          style={{
            marginBottom: 12,
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

        {/* Заголовок */}
        <Title
          level={5}
          style={{
            marginTop: 0,
            marginBottom: 8,
            lineHeight: 1.4,
            fontSize: 15,
            fontWeight: 600,
            color: token.colorText,
          }}
          ellipsis={{ rows: 3 }}
        >
          {doc.title}
        </Title>

        {/* Описание */}
        {doc.description && (
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 3 }}
            style={{ fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}
          >
            {doc.description}
          </Paragraph>
        )}

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
    </Link>
  );
}
