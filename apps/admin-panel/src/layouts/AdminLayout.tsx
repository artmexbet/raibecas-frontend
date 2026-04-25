import { memo, useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Avatar, Badge, Button, Dropdown, Layout, Menu, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  BellOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  SettingOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { authService } from '../services/auth.service';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
}

/* ------------------------------------------------------------------ */
/* Static data hoisted outside the component to avoid re-allocation.  */
/* ------------------------------------------------------------------ */

const MENU_ITEMS: MenuProps['items'] = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Главная' },
  { key: 'documents', icon: <FileTextOutlined />, label: 'Документы' },
  {
    key: 'registration-requests',
    icon: <UserAddOutlined />,
    label: 'Заявки на регистрацию',
  },
  { key: 'users', icon: <TeamOutlined />, label: 'Пользователи' },
  { key: 'chats', icon: <MessageOutlined />, label: 'Чаты' },
  { key: 'settings', icon: <SettingOutlined />, label: 'Настройки' },
];

const ROUTE_MAP: Record<string, string> = {
  dashboard: '/',
  documents: '/documents',
  'registration-requests': '/registration-requests',
  users: '/users',
  settings: '/settings',
  chats: '/chats',
};

const MENU_KEY_BY_PREFIX: Array<[string, string]> = [
  ['/documents', 'documents'],
  ['/registration-requests', 'registration-requests'],
  ['/users', 'users'],
  ['/settings', 'settings'],
  ['/chats', 'chats'],
];

function resolveMenuKey(pathname: string): string {
  if (pathname === '/') return 'dashboard';
  for (let i = 0; i < MENU_KEY_BY_PREFIX.length; i++) {
    const [prefix, key] = MENU_KEY_BY_PREFIX[i]!;
    if (pathname.startsWith(prefix)) return key;
  }
  return 'dashboard';
}

/* ------------------------------------------------------------------ */
/* Static markup — extracted so it doesn't re-render on parent state  */
/* ------------------------------------------------------------------ */

const BrandMark = memo(function BrandMark({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      style={{
        height: 72,
        padding: collapsed ? '0 12px' : '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid rgba(247,242,230,0.08)',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          width: 34,
          height: 34,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#b4884a',
          color: '#16233d',
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 600,
          fontStyle: 'italic',
          letterSpacing: '-0.02em',
          flexShrink: 0,
        }}
      >
        Ϙ
      </div>
      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            style={{
              color: 'rgba(247,242,230,0.55)',
              fontSize: 10,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Raibecas · Admin
          </span>
          <span
            style={{
              color: '#f7f2e6',
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 17,
              lineHeight: 1.15,
              fontStyle: 'italic',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Библиотека философа
          </span>
        </div>
      )}
    </div>
  );
});

const SiderFooter = memo(function SiderFooter({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <div
      style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(247,242,230,0.08)',
        color: 'rgba(247,242,230,0.45)',
        fontSize: 11,
        lineHeight: 1.5,
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
      }}
    >
      «Сомнение есть начало мудрости»
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const routerState = useRouterState();
  const admin = authService.getStoredAdmin();

  const handleLogout = useCallback(async () => {
    await authService.logout();
    await navigate({ to: '/login' });
  }, [navigate]);

  const handleMenuClick = useCallback(
    async ({ key }: { key: string }) => {
      const target = ROUTE_MAP[key];
      if (target) await navigate({ to: target as any });
    },
    [navigate],
  );

  const selectedKey = useMemo(
    () => resolveMenuKey(routerState.location.pathname),
    [routerState.location.pathname],
  );

  const userMenuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'profile', icon: <UserOutlined />, label: 'Профиль' },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Выход',
        onClick: handleLogout,
      },
    ],
    [handleLogout],
  );

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={248}
        collapsedWidth={72}
        style={{
          background: 'var(--ink-900)',
          borderRight: '1px solid rgba(247,242,230,0.06)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'sticky',
            top: 0,
          }}
        >
          <BrandMark collapsed={collapsed} />
          <div style={{ flex: 1, overflow: 'auto', padding: '12px 0' }}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[selectedKey]}
              items={MENU_ITEMS}
              onClick={handleMenuClick}
              style={{
                borderRight: 0,
                background: 'transparent',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
              }}
            />
          </div>
          <SiderFooter collapsed={collapsed} />
        </div>
      </Sider>

      <Layout style={{ background: 'var(--paper)' }}>
        <Header
          style={{
            padding: 0,
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--hairline)',
            height: 64,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
            style={{
              fontSize: 16,
              width: 64,
              height: 64,
              color: 'var(--ink-700)',
            }}
          />
          <Space size={8} style={{ marginRight: 24 }}>
            <Badge count={0} offset={[-2, 2]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18, color: 'var(--ink-500)' }} />}
                aria-label="Уведомления"
              />
            </Badge>
            <div
              aria-hidden
              style={{ width: 1, height: 24, background: 'var(--hairline)' }}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '6px 10px 6px 6px',
                  borderRadius: 8,
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--paper)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{ background: 'var(--ink-900)', color: 'var(--paper)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-400)',
                      fontWeight: 600,
                    }}
                  >
                    Администратор
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontWeight: 500,
                      fontSize: 15,
                      color: 'var(--ink-900)',
                    }}
                  >
                    {admin?.username || 'Аноним'}
                  </span>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: '28px 32px',
            minHeight: 280,
            background: 'var(--surface)',
            borderRadius: 12,
            border: '1px solid var(--hairline)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
