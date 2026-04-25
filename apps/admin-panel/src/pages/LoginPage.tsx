import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { authService } from '../services/auth.service';
import type { LoginCredentials } from '../types/auth';
import './LoginPage.css';

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

/* Static, decorative markup hoisted out of the render function. */
const EditorialPane = () => {
  const year = new Date().getFullYear();
  return (
    <aside className="login-pane--editorial" aria-hidden>
      <div className="login-brand">
        <span className="login-brand__mark">Ϙ</span>
        <div>
          <span className="login-brand__eyebrow">Raibecas · Admin</span>
          <span className="login-brand__name">Библиотека философа</span>
        </div>
      </div>

      <div className="login-quote">
        <span className="login-quote__mark">“</span>
        <p className="login-quote__text">
          Всякая наука начинается с&nbsp;<em>удивления</em>&nbsp;— и&nbsp;продолжается
          ровно столько, сколько сохраняется вкус к&nbsp;вопросу.
        </p>
        <div className="login-quote__attribution">
          по мотивам Аристотеля
        </div>
      </div>

      <footer className="login-footer">
        <span>© {year} · Raibecas</span>
        <span>v. 0.1 — editorial</span>
      </footer>
    </aside>
  );
};

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (values: LoginFormValues) => {
      setLoading(true);
      try {
        const credentials: LoginCredentials = {
          email: values.email,
          password: values.password,
        };
        await authService.login(credentials);
        message.success('Вход выполнен успешно');
        setTimeout(async () => {
          await navigate({ to: '/' });
        }, 450);
      } catch (error: any) {
        console.error('Login error:', error);
        if (error?.message?.includes('message channel closed')) return;
        if (error?.response?.status === 401) {
          message.error('Неверный email или пароль');
        } else if (error?.response?.status === 403) {
          message.error('Доступ запрещён. Недостаточно прав.');
        } else {
          message.error('Ошибка при входе. Попробуйте позже.');
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  return (
    <div className="login-page">
      <EditorialPane />

      <main className="login-pane--form">
        <section className="login-card">
          <header className="login-card__header">
            <span className="login-card__eyebrow">Вход администратора</span>
            <h1 className="login-card__title">С&nbsp;возвращением в&nbsp;библиотеку</h1>
            <p className="login-card__sub">
              Войдите, чтобы продолжить работу над собранием научных работ и&nbsp;каталогом
              пользователей.
            </p>
          </header>

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
                { required: true, message: 'Пожалуйста, введите email' },
                { type: 'email', message: 'Введите корректный email' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'var(--ink-400)' }} />}
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Пароль"
              rules={[
                { required: true, message: 'Пожалуйста, введите пароль' },
                { min: 6, message: 'Пароль должен быть не менее 6 символов' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--ink-400)' }} />}
                placeholder="Введите пароль"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" initialValue={false}>
              <Checkbox>Запомнить меня</Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Войти
              </Button>
            </Form.Item>
          </Form>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
