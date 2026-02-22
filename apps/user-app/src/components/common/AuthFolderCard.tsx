import React from 'react';
import { Typography, theme } from 'antd';
import { Link } from '@tanstack/react-router';

const { Text } = Typography;

export interface FolderTab {
  key: string;
  label: string;
  to: string;
  active: boolean;
}

interface AuthFolderCardProps {
  tabs: FolderTab[];
  children: React.ReactNode;
}

/**
 * Карточка в стиле папки Windows с вкладками-ярлычками
 * Одна общая плашка (прямоугольник со скруглёнными краями), содержимое — внутри
 */
export function AuthFolderCard({ tabs, children }: AuthFolderCardProps) {
  const { token } = theme.useToken();

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      {/* Вкладки-ярлычки (табы папки) */}
      <div style={{ display: 'flex', paddingLeft: 0, gap: 0 }}>
        {tabs.map((tab) =>
          tab.active ? (
            <div
              key={tab.key}
              style={{
                background: token.colorBgContainer,
                padding: '10px 28px',
                borderRadius: '10px 10px 0 0',
                position: 'relative',
                zIndex: 2,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderBottom: `1px solid ${token.colorBgContainer}`,
                  width: '40%',
              }}
            >
              <Text strong style={{ fontSize: 14, color: token.colorText }}>
                {tab.label}
              </Text>
            </div>
          ) : (
            <Link key={tab.key} to={tab.to} style={{ textDecoration: 'none', width: '60%' }}>
              <div
                style={{
                  background: token.colorFillQuaternary,
                  padding: '10px 28px',
                  borderRadius: '10px 10px 0 0',
                  position: 'relative',
                  zIndex: 1,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderBottom: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <Text style={{ fontSize: 14, color: token.colorTextSecondary }}>
                  {tab.label}
                </Text>
              </div>
            </Link>
          )
        )}
      </div>

      {/* Тело папки — единая плашка со скруглёнными краями */}
      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: '0 0px 12px 12px',
          padding: '32px',
          boxShadow: token.boxShadow,
          border: `1px solid ${token.colorBorderSecondary}`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}

