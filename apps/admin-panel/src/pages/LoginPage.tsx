import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Form, Input, Button, Checkbox, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authService } from '../services/auth.service';
import type { LoginCredentials } from '../types/auth';
import './LoginPage.css';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const credentials: LoginCredentials = {
        email: values.email,
        password: values.password,
        remember: values.remember,
      };

      await authService.login(credentials);

      message.success('Вход выполнен успешно!');

      // Небольшая задержка перед редиректом для отображения сообщения
      setTimeout(async () => {
        await navigate({ to: '/' });
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);

      // Игнорируем ошибки расширений браузера
      if (error?.message?.includes('message channel closed')) {
        return;
      }

      if (error.response?.status === 401) {
        message.error('Неверный email или пароль');
      } else if (error.response?.status === 403) {
        message.error('Доступ запрещен. Недостаточно прав.');
      } else {
        message.error('Ошибка при входе. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <Title level={2}>Административная панель</Title>
            <Text type="secondary">Онлайн библиотека научных работ</Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleLogin}
            autoComplete="off"
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Пожалуйста, введите email!' },
                { type: 'email', message: 'Введите корректный email!' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Пароль"
              rules={[
                { required: true, message: 'Пожалуйста, введите пароль!' },
                { min: 6, message: 'Пароль должен быть не менее 6 символов' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Введите пароль"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" initialValue={false}>
              <Checkbox>Запомнить меня</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Войти
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

