import React from 'react';
import {Avatar, Button, Dropdown, Input, Space, theme, Typography} from 'antd';
import {
    ArrowRightOutlined,
    BookOutlined,
    EditOutlined,
    FolderOutlined,
    LogoutOutlined,
    MoonOutlined,
    QuestionCircleOutlined,
    SettingOutlined,
    SunOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {message} from 'antd';
import {useNavigate, useRouterState} from '@tanstack/react-router';
import {useTheme} from '@/theme/ThemeContext';
import {useAuth} from '@/contexts/AuthContext';
import {NavBar} from './NavBar';
import type {NavItem} from './NavBar';
import podpisSvg from '../../podpis.svg';

const {Text} = Typography;

// Маппинг ключ навбара → путь
const NAV_ROUTES: Record<string, string> = {
    catalog: '/catalog',
    settings: '/settings',
};

const defaultNavItems: NavItem[] = [
    {key: 'catalog', icon: FolderOutlined, label: 'Каталог'},
    {key: 'bookmarks', icon: BookOutlined, label: 'Закладки'},
    {key: 'notes', icon: EditOutlined, label: 'Заметки'},
    {key: 'settings', icon: SettingOutlined, label: 'Настройки'},
    {key: 'help', icon: QuestionCircleOutlined, label: 'Вопросы'},
];

interface AppHeaderProps {
    search?: string;
    onSearchChange?: (value: string) => void;
    onSearchSubmit?: () => void;
    navItems?: NavItem[];
    showSearch?: boolean;
}

/**
 * Общий хедер для страниц приложения.
 * Активная вкладка определяется автоматически по текущему пути роутера.
 */
export function AppHeader({
                              search = '',
                              onSearchChange,
                              onSearchSubmit,
                              navItems = defaultNavItems,
                              showSearch = true,
                          }: AppHeaderProps) {
    const {token} = theme.useToken();
    const {mode, toggleTheme} = useTheme();
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const routerState = useRouterState();

    // Определяем активный ключ по текущему пути
    const currentPath = routerState.location.pathname;
    const activeNav = Object.entries(NAV_ROUTES).find(([, path]) =>
        currentPath.startsWith(path)
    )?.[0] ?? 'catalog';

    const handleNavChange = (key: string) => {
        const path = NAV_ROUTES[key];
        if (path) navigate({to: path});
    };

    const handleLogout = async () => {
        try {
            await logout();
            message.success('Вы вышли из системы');
            navigate({to: '/login'});
        } catch {
            message.error('Ошибка при выходе');
        }
    };

    const userMenuItems = [
        {
            key: 'username',
            label: (
                <div style={{padding: '4px 0'}}>
                    <Text strong style={{display: 'block'}}>{user?.username ?? user?.email}</Text>
                    {user?.email && user?.username && (
                        <Text type="secondary" style={{fontSize: 12}}>{user.email}</Text>
                    )}
                </div>
            ),
            disabled: true,
        },
        {type: 'divider' as const},
        {
            key: 'logout',
            icon: <LogoutOutlined/>,
            label: 'Выйти',
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <header
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '0 32px',
                height: 80,
                background: token.colorBgContainer,
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}
        >
            {/* Логотип */}
            <div style={{display: 'flex', alignItems: 'center', flexShrink: 0}}>
                <img src={podpisSvg} alt="Райбекас" style={{height: 32, width: 'auto'}}/>
            </div>

            {/* Навигация */}
            <NavBar items={navItems} activeKey={activeNav} onChange={handleNavChange}/>

            {/* Правая часть */}
            <Space style={{marginLeft: 'auto'}} align="center">
                {showSearch && (
                    <Input
                        placeholder="Введите для поиска"
                        allowClear
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        suffix={
                            <Button
                                type="text"
                                icon={<ArrowRightOutlined/>}
                                onClick={onSearchSubmit}
                                style={{padding: '0 6px'}}
                            />
                        }
                        style={{width: 280, borderRadius: 20}}
                    />
                )}

                {/* Переключатель темы */}
                <Button
                    type="text"
                    icon={mode === 'dark' ? <SunOutlined/> : <MoonOutlined/>}
                    onClick={toggleTheme}
                    shape="circle"
                    size="large"
                />
            </Space>
        </header>
    );
}
