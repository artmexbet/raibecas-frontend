import React from 'react';
import { Card, Tag, Typography, theme } from 'antd';
import { CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import type { Document } from '@/types/document';

const { Title, Text, Paragraph } = Typography;

interface DocumentCardProps {
  doc: Document;
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const { token } = theme.useToken();

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
            {doc.author.name}
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
