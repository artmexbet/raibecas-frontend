import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, Spin, Alert, Button, Row, Col, Statistic, Space, Divider } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, CommentOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import { documentService } from '@/services/document.service';
import { DocumentViewer } from '@/components';
import type { Document } from '@/types/document';
import { statisticCardColors, statisticColors } from '@/theme';
import './DocumentViewPage.css';

export function DocumentViewPage() {
  const params = useParams({ strict: false });
  const id = (params as any).id;
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={handleEdit}
          size="large"
        >
          Редактировать
        </Button>
      </div>

      {/* Статистика просмотров */}
      <Card
        title="Статистика документа"
        className="document-view-page__stats-card"
      >
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ color: statisticColors.views }}>
              <Statistic
                title="Всего просмотров"
                value={document.views ?? 0}
                prefix={<EyeOutlined />}
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={{ color: statisticColors.notes }}>
              <Statistic
                title="Количество заметок"
                value={document.notesCount ?? 0}
                prefix={<CommentOutlined />}
              />
            </div>
          </Col>
          <Col span={6}>
            <Card
              variant='outlined'
              style={{ background: statisticCardColors.date.background }}
            >
              <Space orientation="vertical" size="small">
                <div className="document-view-page__date-card-label">
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  Дата создания
                </div>
                <div className="document-view-page__date-card-value">
                  {formatDate(document.createdAt)}
                </div>
              </Space>
            </Card>
          </Col>
          <Col span={6}>
            <Card
              variant='outlined'
              style={{ background: statisticCardColors.date.background }}
            >
              <Space orientation="vertical" size="small">
                <div className="document-view-page__date-card-label">
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  Последнее обновление
                </div>
                <div className="document-view-page__date-card-value">
                  {formatDate(document.updatedAt)}
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Дополнительная статистика по просмотрам пользователями */}
        <div>
          <h3 className="document-view-page__stats-section-title">Активность пользователей</h3>
          <Row gutter={16}>
            <Col span={8}>
              <Card
                variant='outlined'
                style={{ background: statisticCardColors.time.background }}
              >
                <div style={{ fontSize: '24px', color: statisticCardColors.time.color }}>
                  <Statistic
                    title="Среднее время чтения"
                    value={12}
                    suffix="мин"
                  />
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                variant='outlined'
                style={{ background: statisticCardColors.users.background }}
              >
                <div style={{ fontSize: '24px', color: statisticCardColors.users.color }}>
                  <Statistic
                    title="Уникальные пользователи"
                    value={Math.floor((document.views ?? 0) * 0.7)}
                  />
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                variant='outlined'
                style={{ background: statisticCardColors.repeats.background }}
              >
                <div style={{ fontSize: '24px', color: statisticCardColors.repeats.color }}>
                  <Statistic
                    title="Повторные просмотры"
                    value={Math.floor((document.views ?? 0) * 0.3)}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Сам документ */}
      <DocumentViewer document={document} showMetadata={false} />
    </div>
  );
}

