import React from 'react';
import {Button, theme} from 'antd';

export interface NavItem {
    key: string;
    icon: React.ComponentType<{ style?: React.CSSProperties }>;
    label: string;
}

interface NavBarProps {
    items: NavItem[];
    activeKey?: string;
    onChange?: (key: string) => void;
}

/**
 * Горизонтальная навигационная панель — «таблетка» со скруглёнными краями.
 * Переиспользуется в любом месте приложения, набор кнопок передаётся через props.
 */
export function NavBar({items, activeKey, onChange}: NavBarProps) {
    const {token} = theme.useToken();

    if (items.length === 0) return null;

    return (
        <nav
            style={{
                display: 'flex',
                alignItems: 'center',
                background: token.colorBgNav,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 32,
                padding: '4px',
                gap: 2,
            }}
        >
            {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeKey === item.key;
                return (
                    <Button
                        key={item.key}
                        type="text"
                        onClick={() => onChange?.(item.key)}
                        style={{
                            borderRadius: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            height: 'auto',
                            padding: '6px 18px',
                            background: isActive ? token.colorBgNavActive : 'transparent',
                            color: isActive ? token.colorPrimary : token.colorTextSecondary,
                            boxShadow: 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Icon style={{fontSize: 18, marginBottom: 2}}/>
                        <span style={{fontSize: 11, lineHeight: 1.2}}>{item.label}</span>
                    </Button>
                );
            })}
        </nav>
    );
}

