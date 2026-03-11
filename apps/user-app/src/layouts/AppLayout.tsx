import React from 'react';
import { Layout, theme } from 'antd';
import { useTheme } from '@/theme/ThemeContext';
import { AppHeader, PageBackground } from '@/components/common';

const { Content, Footer } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { mode } = useTheme();
  const { token } = theme.useToken();

  const headerBorder = mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout, position: 'relative' }}>
      {/* Фон на всю страницу */}
      <PageBackground opacity={0.04} />

      {/* Общий хедер приложения */}
      <AppHeader />

      <Content
        style={{
          padding: '40px 32px',
          maxWidth: 1440,
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </Content>

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
    </Layout>
  );
}
