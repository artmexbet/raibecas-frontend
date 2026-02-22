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
import podpisSvg from '../../podpis.svg';

export interface NavItem {
    key: string;
    icon: React.ComponentType<{ style?: React.CSSProperties }>;
    label: string;
}

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
                height: 64,
                background: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}
        >
            {/* Логотип — podpis.svg */}
            <div style={{display: 'flex', alignItems: 'center', flexShrink: 0}}>
                <img
                    src={podpisSvg}
                    alt="Райбекас"
                    style={{height: 32, width: 'auto'}}
                />
            </div>

            {/* Навигация — единая плашка со скруглёнными краями, кнопки внутри */}
            {navItems.length > 0 && (
                <nav
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: token.colorFillQuaternary,
                        borderRadius: 32,
                        padding: '4px',
                        gap: 2,
                        margin: 10,
                    }}
                >
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeNav === item.key;
                        return (
                            <Button
                                key={item.key}
                                type="text"
                                onClick={() => onNavChange?.(item.key)}
                                style={{
                                    borderRadius: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    height: 'auto',
                                    padding: '6px 18px',
                                    background: isActive ? token.colorBgContainer : 'transparent',
                                    color: isActive ? token.colorPrimary : token.colorTextSecondary,
                                    boxShadow: isActive ? token.boxShadowSecondary : 'none',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Icon style={{fontSize: 18, marginBottom: 2}}/>
                                <span style={{fontSize: 11, lineHeight: 1.2}}>{item.label}</span>
                            </Button>
                        );
                    })}
                </nav>
            )}

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

