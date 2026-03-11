import React, { useEffect, useState } from 'react';
import { Typography, Tag, Breadcrumb, Spin, Button, Divider, theme } from 'antd';
import { CalendarOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useParams } from '@tanstack/react-router';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { documentService } from '@/services/document.service';
import type { Document } from '@/types/document';
import { AppLayout } from '@/layouts/AppLayout';

const { Title, Text, Paragraph } = Typography;

export function DocumentViewPage() {
  const { id } = useParams({ from: '/documents/$id' });
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = theme.useToken();

  useEffect(() => {
    documentService
      .getById(id)
      .then(setDocument)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <Spin size="large" />
        </div>
      </AppLayout>
    );
  }

  if (!document) {
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
          { title: document.title },
        ]}
      />

      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Hero обложка */}
        {document.cover_url && (
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
              src={document.cover_url}
              alt={document.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}
        {/* Мета */}
        <div style={{ marginBottom: 12 }}>
          <Tag color="blue">{document.category.title}</Tag>
        </div>

        <Title level={2} style={{ marginBottom: 16 }}>
          {document.title}
        </Title>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
          <Text type="secondary">
            <UserOutlined style={{ marginRight: 6 }} />
            {document.author.name}
          </Text>
          <span style={{ color: '#d9d9d9' }}>|</span>
          <Text type="secondary">
            <CalendarOutlined style={{ marginRight: 6 }} />
            {dayjs(document.publication_date).format('D MMMM YYYY')}
          </Text>
        </div>

        {document.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {document.tags.map((tag) => (
              <Tag key={tag.id}>{tag.title}</Tag>
            ))}
          </div>
        )}

        <Divider />

        {/* Описание */}
        {document.description && (
          <Paragraph
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: token.colorTextSecondary,
              marginBottom: 32,
            }}
          >
            {document.description}
          </Paragraph>
        )}

        {/* Контент */}
        {document.content && (
          <div className="document-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {document.content}
            </ReactMarkdown>
          </div>
        )}

        <Divider />

        <Link to="/catalog">
          <Button icon={<ArrowLeftOutlined />}>Вернуться в каталог</Button>
        </Link>
      </div>
    </AppLayout>
  );
}

