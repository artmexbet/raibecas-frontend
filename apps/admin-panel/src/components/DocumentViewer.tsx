import React from 'react';
import { Card, Typography, Tag, Space } from 'antd';
import { CalendarOutlined, UserOutlined, FolderOutlined } from '@ant-design/icons';
import { XMarkdown } from '@ant-design/x-markdown';
import type { Document } from '@/types/document';
import './DocumentViewer.css';

const { Title, Text } = Typography;

interface DocumentViewerProps {
  document: Document;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="document-viewer">
      <Card className="document-viewer__header-card" variant="outlined">
        <Title level={2} className="document-viewer__title">
          {document.title}
        </Title>

        <Space size="large" wrap className="document-viewer__author-section">
          <Text strong>
            <UserOutlined style={{ marginRight: 8 }} />
            {document.author.name}
          </Text>
          <Text type="secondary">
            <CalendarOutlined style={{ marginRight: 8 }} />
            {formatDate(document.publication_date)}
          </Text>
        </Space>

        <Space size="middle" wrap className="document-viewer__tags-section">
          <Space>
            <FolderOutlined />
            <Tag color="blue">{document.category.title}</Tag>
          </Space>
          {document.tags?.length > 0 && (
            <Space size="small" wrap>
              {document.tags.map(tag => (
                <Tag key={tag.id} color="default">
                  {tag.title}
                </Tag>
              ))}
            </Space>
          )}
        </Space>
      </Card>

      <Card variant="outlined">
        <div className="document-viewer__content">
          <XMarkdown content={document.content || ''} />
        </div>
      </Card>
    </div>
  );
}
