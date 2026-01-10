import { Card, Col, Row, Statistic } from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  UserAddOutlined,
  CommentOutlined,
} from '@ant-design/icons';

export function DashboardPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Панель управления</h1>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Всего документов"
              value={0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Пользователей"
              value={0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Заявок на регистрацию"
              value={0}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Заметок создано"
              value={0}
              prefix={<CommentOutlined />}
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

