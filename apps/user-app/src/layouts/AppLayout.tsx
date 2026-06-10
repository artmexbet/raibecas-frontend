import React from 'react';
import { Layout, theme } from 'antd';
import { useTheme } from '@/theme/ThemeContext';
import { AppHeader, BottomNavBar, PageBackground } from '@/components/common';
import type { AppHeaderProps } from '@/components/common/AppHeader';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Content, Footer } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  contentPadding?: React.CSSProperties['padding'];
  contentMaxWidth?: React.CSSProperties['maxWidth'];
  headerProps?: AppHeaderProps;
}

export function AppLayout({
  children,
  hideFooter = false,
  contentPadding = '40px 32px',
  contentMaxWidth = 1440,
  headerProps,
}: AppLayoutProps) {
  const { mode } = useTheme();
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

  const headerBorder = mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout, position: 'relative' }}>
      {/* Фон на всю страницу */}
      <PageBackground opacity={0.04} />

      {/* Общий хедер приложения */}
      <AppHeader {...headerProps} />

      <Content
        style={{
          padding: contentPadding,
          maxWidth: contentMaxWidth,
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 1,
          overflow: 'visible',
          ...(isMobile ? { paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 100 } : null),
        }}
      >
        {children}
      </Content>

      {!hideFooter && !isMobile ? (
        <Footer
          style={{
            textAlign: 'center',
            background: 'transparent',
            color: token.colorTextTertiary,
            fontSize: 13,
            padding: '20px 32px',
            borderTop: `1px solid ${headerBorder}`,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Raibecas © {new Date().getFullYear()} — Библиотека научных работ
        </Footer>
      ) : null}

      <BottomNavBar />
    </Layout>
  );
}
