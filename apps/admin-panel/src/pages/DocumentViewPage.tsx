import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Alert, Button, Space, Spin, Tag, Tooltip, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { documentService } from '@/services/document.service';
import { DocumentViewer } from '@/components';
import type { Document } from '@/types/document';
import './DocumentViewPage.css';

export function DocumentViewPage() {
  const params = useParams({ strict: false });
  const id = (params as any).id;
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reindexing, setReindexing] = useState(false);

  useEffect(() => {
    if (id) {
      loadDocument(id);
    }
  }, [id]);

  const loadDocument = async (documentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getById(documentId);
      setDocument(data);
    } catch (err) {
      setError('Не удалось загрузить документ');
      console.error('Error loading document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate({ to: '/documents' });
  };

  const handleEdit = () => {
    if (document) {
      navigate({ to: `/documents/${document.id}/edit` });
    }
  };

  const handleReindex = async () => {
    if (!document) return;
    setReindexing(true);
    try {
      await documentService.reindex(document.id);
      message.success('Документ поставлен в очередь на индексацию');
      await loadDocument(document.id);
    } catch {
      message.error('Ошибка при запуске индексации');
    } finally {
      setReindexing(false);
    }
  };

  if (loading) {
    return (
      <div className="document-view-page__loading">
        <Spin size="large" tip="Загрузка документа..." />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="document-view-page__error-back-button"
        >
          Назад к списку
        </Button>
        <Alert
          title="Ошибка"
          description={error || 'Документ не найден'}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      {/* Заголовок с кнопками */}
      <div className="document-view-page__header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          size="large"
        >
          Назад к списку
        </Button>
        <Space size={8}>
          {document.is_public ? (
            <Tag color="success">Опубликован</Tag>
          ) : (
            <Tag color="orange">Черновик</Tag>
          )}
          {document.indexed ? (
            <Tag color="blue">Проиндексирован</Tag>
          ) : (
            <Tag color="warning">Не проиндексирован</Tag>
          )}
        </Space>
        <Space size={8}>
          {!document.indexed && (
            <Tooltip title="Запустить индексацию документа">
              <Button
                icon={<ThunderboltOutlined />}
                loading={reindexing}
                onClick={handleReindex}
                size="large"
              >
                Индексировать
              </Button>
            </Tooltip>
          )}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
            size="large"
          >
            Редактировать
          </Button>
        </Space>
      </div>

      {/* Сам документ */}
      <DocumentViewer document={document} />
    </div>
  );
}

