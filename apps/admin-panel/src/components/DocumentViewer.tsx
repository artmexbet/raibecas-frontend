import React from 'react';
import { Card, Typography, Tag, Space } from 'antd';
import { CalendarOutlined, UserOutlined, FolderOutlined, EyeOutlined, CommentOutlined } from '@ant-design/icons';
import { XMarkdown } from '@ant-design/x-markdown';
import type { Document } from '@/types/document';
import './DocumentViewer.css';

const { Title, Text } = Typography;

interface DocumentViewerProps {
  document: Document;
  showMetadata?: boolean;
}

/**
 * Переиспользуемый компонент для отображения документа
 * Может использоваться как в админ-панели, так и в пользовательском интерфейсе
 */
export function DocumentViewer({ document, showMetadata = true }: DocumentViewerProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="document-viewer">
      {/* Заголовок документа */}
      <Card className="document-viewer__header-card" variant='outlined'>
        <Title level={2} className="document-viewer__title">
          {document.title}
        </Title>

        {/* Автор */}
        <Space size="large" wrap className="document-viewer__author-section">
          <Text strong>
            <UserOutlined style={{ marginRight: 8 }} />
            {document.author}
          </Text>
          <Text type="secondary">
            <CalendarOutlined style={{ marginRight: 8 }} />
            {formatDate(document.publicationDate)}
          </Text>
        </Space>

        {/* Категория и теги */}
        <Space size="middle" wrap className="document-viewer__tags-section">
          <Space>
            <FolderOutlined />
            <Tag color="blue">{document.category}</Tag>
          </Space>

          {document.tags && document.tags.length > 0 && (
            <Space size="small" wrap>
              {document.tags.map(tag => (
                <Tag key={tag} color="default">
                  {tag}
                </Tag>
              ))}
            </Space>
          )}
        </Space>

        {/* Статистика просмотров и заметок */}
        {showMetadata && (
          <Space size="large">
            <Space size="small">
              <EyeOutlined />
              <Text type="secondary">{document.views} просмотров</Text>
            </Space>
            <Space size="small">
              <CommentOutlined />
              <Text type="secondary">{document.notesCount} заметок</Text>
            </Space>
          </Space>
        )}
      </Card>

      {/* Содержимое документа */}
      <Card variant='outlined'>
        <div className="document-viewer__content">
          <XMarkdown content={document.content} />
        </div>
      </Card>
    </div>
  );
}

