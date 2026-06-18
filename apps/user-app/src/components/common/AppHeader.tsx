import React from 'react';
import {Button, Input, Space, theme} from 'antd';
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    BookOutlined,
    EditOutlined,
    FolderOutlined,
    MenuOutlined,
    QuestionCircleOutlined,
    SearchOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import {useNavigate, useRouter, useRouterState} from '@tanstack/react-router';
import {NavBar} from './NavBar';
import type {NavItem} from './NavBar';
import {ThemeToggleButton} from './ThemeToggleButton';
import {NAV_ROUTES} from '@/constants/navigation';
import {useIsMobile} from '@/hooks/useIsMobile';
import raibLogo from '../../raib_logo.svg';
import loginLogoSvg from '../../login_logo.svg';

const defaultNavItems: NavItem[] = [
    {key: 'catalog', icon: FolderOutlined, label: 'Каталог'},
    {key: 'search', icon: SearchOutlined, label: 'Поиск'},
    {key: 'bookmarks', icon: BookOutlined, label: 'Закладки'},
    {key: 'notes', icon: EditOutlined, label: 'Заметки'},
    {key: 'settings', icon: SettingOutlined, label: 'Настройки'},
    {key: 'help', icon: QuestionCircleOutlined, label: 'Вопросы'},
];

export interface AppHeaderProps {
    search?: string;
    onSearchChange?: (value: string) => void;
    onSearchSubmit?: () => void;
    navItems?: NavItem[];
    showSearch?: boolean;
    /** Мобильный хедер без поиска: показать кнопку-гамбургер справа (например, список чатов) */
    onMobileMenuClick?: () => void;
}

/**
 * Общий хедер для страниц приложения.
 * Активная вкладка определяется автоматически по текущему пути роутера.
 * На мобильных экранах хедер сворачивается до строки поиска
 * либо до «назад + логотип + меню» (если showSearch=false).
 */
export function AppHeader({
                              search = '',
                              onSearchChange,
                              onSearchSubmit,
                              navItems = defaultNavItems,
                              showSearch = true,
                              onMobileMenuClick,
                          }: AppHeaderProps) {
    const {token} = theme.useToken();
    const navigate = useNavigate();
    const router = useRouter();
    const routerState = useRouterState();
    const isMobile = useIsMobile();

    // Определяем активный ключ по текущему пути
    const currentPath = routerState.location.pathname;
    const activeNav = Object.entries(NAV_ROUTES).find(([, path]) =>
        currentPath.startsWith(path)
    )?.[0] ?? 'catalog';

    const handleNavChange = (key: string) => {
        const path = NAV_ROUTES[key];
        if (path) navigate({to: path});
    };

    if (isMobile) {
        if (showSearch) {
            return (
                <header
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: token.colorBgContainer,
                        position: 'sticky',
                        top: 0,
                        zIndex: 100,
                    }}
                >
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
                        style={{width: '100%', borderRadius: 20}}
                    />
                </header>
            );
        }

        return (
            <header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 8px',
                    height: 64,
                    background: token.colorBgContainer,
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}
            >
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined/>}
                    shape="circle"
                    size="large"
                    onClick={() => router.history.back()}
                    aria-label="Назад"
                />

                <img src={loginLogoSvg} alt="Райбекас" className="themed-logo" style={{height: 28, width: 'auto'}}/>

                {onMobileMenuClick ? (
                    <Button
                        type="text"
                        icon={<MenuOutlined/>}
                        shape="circle"
                        size="large"
                        onClick={onMobileMenuClick}
                        aria-label="Меню"
                    />
                ) : (
                    <div style={{width: 40}}/>
                )}
            </header>
        );
    }

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
                <img src={raibLogo} alt="Райбекас" className="themed-logo" style={{height: 32, width: 'auto'}}/>
            </div>

            {/* Навигация */}
            <NavBar items={navItems} activeKey={activeNav} onChange={handleNavChange}/>

            {/* Правая часть */}
            <Space style={{marginLeft: 'auto'}} align="center">
                {showSearch && (
                    <Input
                        size="small"
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
                        style={{width: 280, height: 40, borderRadius: 20}}
                    />
                )}

                {/* Переключатель темы */}
                <ThemeToggleButton/>
            </Space>
        </header>
    );
}
