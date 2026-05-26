import React from 'react';
import { Card, Tag, Typography, theme } from 'antd';
import { CalendarOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import type { QuoteBookmark } from '@/types/bookmark';
import { BookmarkRibbon } from './BookmarkRibbon';

const { Title, Text, Paragraph } = Typography;

interface QuoteBookmarkCardProps {
  bookmark: QuoteBookmark;
}

export function QuoteBookmarkCard({ bookmark }: QuoteBookmarkCardProps) {
  const { token } = theme.useToken();

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: -8, right: 18, zIndex: 2, pointerEvents: 'none' }}>
        <BookmarkRibbon />
      </div>

      <Link
        to="/documents/$id"
        params={{ id: bookmark.document.id }}
        search={{ highlight: bookmark.quote_text }}
        style={{ display: 'block', textDecoration: 'none' }}
      >
        <Card
          hoverable
          size="small"
          style={{
            borderRadius: 18,
            overflow: 'hidden',
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            transition: 'box-shadow 0.2s ease, transform 0.15s ease',
          }}
          styles={{ body: { padding: '22px 22px 18px' } }}
        >
          <Text
            type="secondary"
            style={{
              display: 'block',
              fontSize: 12,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Цитируемый текст
          </Text>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span
              aria-hidden
              style={{
                fontSize: 44,
                lineHeight: 1,
                color: token.colorTextQuaternary,
                fontFamily: 'Georgia, serif',
                transform: 'translateY(-4px)',
              }}
            >
              &ldquo;
            </span>

            <Paragraph
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.8,
                color: token.colorText,
                fontWeight: 500,
              }}
            >
              {bookmark.quote_text}
            </Paragraph>
          </div>

          {bookmark.context ? (
            <Paragraph
              type="secondary"
              style={{
                marginTop: 16,
                marginBottom: 18,
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              {bookmark.context}
            </Paragraph>
          ) : null}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <Tag
              style={{
                margin: 0,
                borderRadius: 999,
                paddingInline: 10,
                background: token.colorFillSecondary,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <FileTextOutlined style={{ marginRight: 6 }} />
              {bookmark.document.category.title}
            </Tag>

            {bookmark.page_label ? (
              <Tag
                style={{
                  margin: 0,
                  borderRadius: 999,
                  paddingInline: 10,
                  background: `${token.colorPrimary}12`,
                  color: token.colorPrimary,
                  border: `1px solid ${token.colorPrimary}26`,
                }}
              >
                стр. {bookmark.page_label}
              </Tag>
            ) : null}
          </div>

          <div
            style={{
              paddingTop: 14,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              display: 'grid',
              gap: 8,
            }}
          >
            <Title level={5} style={{ margin: 0, lineHeight: 1.35, fontSize: 18 }}>
              {bookmark.document.title}
            </Title>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <UserOutlined style={{ marginRight: 5 }} />
                {bookmark.document.author.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CalendarOutlined style={{ marginRight: 5 }} />
                Сохранено {dayjs(bookmark.saved_at).format('DD.MM.YYYY')}
              </Text>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
