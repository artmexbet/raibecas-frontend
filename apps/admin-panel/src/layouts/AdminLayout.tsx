import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  UserAddOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { authService } from '../services/auth.service';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const routerState = useRouterState();
  const admin = authService.getStoredAdmin();

  const handleLogout = async () => {
    await authService.logout();
    await navigate({ to: '/login' });
  };

  const handleMenuClick = async (key: string) => {
    const routes: Record<string, string> = {
      dashboard: '/',
      documents: '/documents',
      'registration-requests': '/registration-requests',
      users: '/users',
      settings: '/settings',
      chats: '/chats',
    };

    if (routes[key]) {
      await navigate({ to: routes[key] as any });
    }
  };

  // Определяем текущий выбранный пункт меню на основе текущего пути
  const currentPath = routerState.location.pathname;
  const selectedKey =
    currentPath === '/' ? 'dashboard' :
    currentPath.startsWith('/documents') ? 'documents' :
    currentPath.startsWith('/registration-requests') ? 'registration-requests' :
    currentPath.startsWith('/users') ? 'users' :
    currentPath.startsWith('/settings') ? 'settings' :
    currentPath.startsWith('/chats') ? 'chats' :
    'dashboard';

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Главная',
    },
    {
      key: 'documents',
      icon: <FileTextOutlined />,
      label: 'Документы',
    },
    {
      key: 'registration-requests',
      icon: <UserAddOutlined />,
      label: 'Заявки на регистрацию',
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Пользователи',
    },
    {
      key: 'chats',
      icon: <MessageOutlined />,
      label: 'Чаты',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выход',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: 32,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 14 : 18,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'БФ' : 'Библиотека Философа'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Space style={{ marginRight: 24 }}>
            <Badge count={0}>
              <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{admin?.username || 'Администратор'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

