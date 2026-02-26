import React from 'react';
import {Button, Input, Space, theme} from 'antd';
import {
    ArrowRightOutlined,
    BookOutlined,
    EditOutlined,
    FolderOutlined,
    MoonOutlined,
    QuestionCircleOutlined,
    SettingOutlined,
    SunOutlined,
} from '@ant-design/icons';
import {useTheme} from '@/theme/ThemeContext';
import {NavBar} from './NavBar';
import type {NavItem} from './NavBar';
import podpisSvg from '../../podpis.svg';

const defaultNavItems: NavItem[] = [
    {key: 'catalog', icon: FolderOutlined, label: 'Каталог'},
    {key: 'bookmarks', icon: BookOutlined, label: 'Закладки'},
    {key: 'notes', icon: EditOutlined, label: 'Заметки'},
    {key: 'settings', icon: SettingOutlined, label: 'Настройки'},
    {key: 'help', icon: QuestionCircleOutlined, label: 'Вопросы'},
];

interface AppHeaderProps {
    activeNav?: string;
    onNavChange?: (key: string) => void;
    search?: string;
    onSearchChange?: (value: string) => void;
    onSearchSubmit?: () => void;
    navItems?: NavItem[];
    showSearch?: boolean;
}

/**
 * Общий хедер для страниц приложения (каталог, просмотр документа и т.д.)
 */
export function AppHeader({
                              activeNav,
                              onNavChange,
                              search = '',
                              onSearchChange,
                              onSearchSubmit,
                              navItems = defaultNavItems,
                              showSearch = true,
                          }: AppHeaderProps) {
    const {token} = theme.useToken();
    const {mode, toggleTheme} = useTheme();

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
                <img
                    src={podpisSvg}
                    alt="Райбекас"
                    style={{height: 32, width: 'auto'}}
                />
            </div>

            {/* Навигация */}
            <NavBar
                items={navItems}
                activeKey={activeNav}
                onChange={onNavChange}
            />

            {/* Правая часть */}
            <Space style={{marginLeft: 'auto'}}>
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
