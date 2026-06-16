import React from 'react';
import { theme } from 'antd';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { NAV_ROUTES, mobileNavItems } from '@/constants/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';

/**
 * Нижняя панель навигации для мобильной вёрстки. На десктопе ничего не рендерит.
 */
export function BottomNavBar() {
  const isMobile = useIsMobile();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const routerState = useRouterState();

  if (!isMobile) {
    return null;
  }

  const currentPath = routerState.location.pathname;
  const activeKey = Object.entries(NAV_ROUTES).find(([, path]) =>
    currentPath.startsWith(path)
  )?.[0];

  return (
    <nav
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '6px 4px',
        borderRadius: 28,
        background: token.colorBgElevated,
        boxShadow: token.boxShadowSecondary,
      }}
    >
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === activeKey;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate({ to: NAV_ROUTES[item.key] })}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              flex: 1,
              border: 'none',
              background: isActive ? token.colorFill : 'transparent',
              borderRadius: 18,
              padding: '6px 4px',
              color: isActive ? token.colorPrimary : token.colorTextSecondary,
              cursor: 'pointer',
            }}
          >
            <Icon style={{ fontSize: 20 }} />
            <span style={{ fontSize: 10, lineHeight: 1.2 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
