import React, {useState} from 'react';
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
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);

    if (items.length === 0) return null;

    return (
        <nav
            style={{
                display: 'flex',
                alignItems: 'center',
                background: token.colorBgNav,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 32,
                // Небольшой равномерный отступ: подсветка пункта почти достаёт до края,
                // а её радиус концентричен радиусу «таблетки» (32 − 3 = 29).
                padding: '3px',
                gap: 2,
            }}
        >
            {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeKey === item.key;
                const isHovered = hoveredKey === item.key;
                // Цвет текста/иконки не меняется ни при выборе, ни при наведении —
                // активный пункт выделяется только фоном.
                const background = isActive
                    ? token.colorBgNavActive
                    : isHovered
                        ? token.colorFillSecondary
                        : 'transparent';

                return (
                    <Button
                        key={item.key}
                        type="text"
                        onClick={() => onChange?.(item.key)}
                        onMouseEnter={() => setHoveredKey(item.key)}
                        onMouseLeave={() => setHoveredKey(null)}
                        style={{
                            borderRadius: 29,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            height: 'auto',
                            padding: '6px 18px',
                            background,
                            color: token.colorTextSecondary,
                            boxShadow: 'none',
                            transition: 'background 0.2s',
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

