import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin, message, List, Typography } from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  UserAddOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import { statsService } from '../services/stats.service';
import type { DashboardStats } from '@/mocks';

const { Text } = Typography;

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
      message.error('Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Загрузка статистики..." />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Панель управления</h1>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Всего документов"
              value={stats?.documentsCount ?? 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Пользователей"
              value={stats?.usersCount ?? 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Заявок на регистрацию"
              value={stats?.pendingRequestsCount ?? 0}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Заметок создано"
              value={stats?.totalNotesCount ?? 0}
              prefix={<CommentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Последние документы">
            <List
              dataSource={stats?.recentDocuments ?? []}
              renderItem={(doc) => (
                <List.Item>
                  <List.Item.Meta
                    title={doc.title}
                    description={
                      <>
                        <Text type="secondary">{doc.author}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatDate(doc.createdAt)}
                        </Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Последние пользователи">
            <List
              dataSource={stats?.recentUsers ?? []}
              renderItem={(user) => (
                <List.Item>
                  <List.Item.Meta
                    title={user.username}
                    description={
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Регистрация: {formatDate(user.registeredAt)}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Добро пожаловать!" style={{ marginTop: 24 }}>
        <p>
          Это административная панель для управления онлайн библиотекой научных работ философа.
        </p>
        <p>
          Здесь вы можете управлять документами, пользователями и заявками на регистрацию.
        </p>
      </Card>
    </div>
  );
}

