import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, theme, Tooltip } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { AuthHeader, AuthFolderCard, PageBackground } from '@/components/common';

const { Text } = Typography;

interface LoginFormValues {
  login: string;
  password: string;
}

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { login } = useAuth();

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login({ email: values.login, password: values.password });
      message.success('Добро пожаловать!');
      setTimeout(() => navigate({ to: '/catalog' }), 400);
    } catch (error: unknown) {
      const err = error as { response?: { status: number } };
      if (err.response?.status === 401) {
        message.error('Неверный логин или пароль');
      } else {
        message.error('Ошибка при входе. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const folderTabs = [
    { key: 'login', label: 'Авторизация', to: '/login', active: true },
    { key: 'register', label: 'Регистрация', to: '/register', active: false },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: token.colorBgLayout,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Подпись на весь фон */}
      <PageBackground opacity={0.08} />

      {/* Хедер с логотипом */}
      <AuthHeader />

      {/* Центрированный контент */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          paddingTop: 64,
          padding: '64px 24px 24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <AuthFolderCard tabs={folderTabs}>
          <Form form={form} layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label={<Text style={{ fontSize: 15 }}>* Логин</Text>}
              name="login"
              rules={[{ required: true, message: 'Введите логин' }]}
              style={{ marginBottom: 20 }}
            >
              <Input
                placeholder="Введите логин"
                size="large"
                style={{
                  borderRadius: 12,
                  background: token.colorFillSecondary,
                  borderColor: token.colorBorder,
                  height: 48,
                }}
              />
            </Form.Item>

            <Form.Item
              label={<Text style={{ fontSize: 15 }}>* Пароль</Text>}
              name="password"
              rules={[{ required: true, message: 'Введите пароль' }]}
              style={{ marginBottom: 8 }}
            >
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                size="large"
                suffix={
                  <Button
                    type="text"
                    icon={showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ padding: 0, color: token.colorTextSecondary }}
                  />
                }
                style={{
                  borderRadius: 12,
                  background: token.colorFillSecondary,
                  borderColor: token.colorBorder,
                  height: 48,
                }}
              />
            </Form.Item>

            {/* Забыли пароль */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <Tooltip
                title={
                  <div style={{ maxWidth: 260, textAlign: 'center', padding: 8 }}>
                    <Text style={{ color: token.colorTextSecondary, fontSize: 13 }}>
                      Если вы забыли ваш логин или пароль, напишите нам в поддержку для его восстановления по адресу:
                    </Text>
                    <br />
                    <a href="mailto:support@raibekas.ru" style={{ color: token.colorPrimary }}>
                      support@raibekas.ru
                    </a>
                  </div>
                }
                placement="bottomRight"
                color={token.colorBgElevated}
              >
                <Button
                  type="link"
                  style={{ padding: 0, color: token.colorTextSecondary, textDecoration: 'underline' }}
                >
                  Забыли пароль?
                </Button>
              </Tooltip>
            </div>

            <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
              <Button
                type="default"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{
                  borderRadius: 20,
                  height: 44,
                  padding: '0 48px',
                  background: token.colorFill,
                  borderColor: token.colorBorder,
                  color: token.colorText,
                }}
              >
                Войти
              </Button>
            </Form.Item>
          </Form>
        </AuthFolderCard>
      </div>
    </div>
  );
}
