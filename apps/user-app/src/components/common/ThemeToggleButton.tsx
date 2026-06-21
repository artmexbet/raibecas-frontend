import React from 'react';
import { Button } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from '@/theme/ThemeContext';

interface ThemeToggleButtonProps {
  size?: 'large' | 'middle' | 'small';
}

/**
 * Кнопка переключения светлой/тёмной темы.
 */
export function ThemeToggleButton({ size = 'large' }: ThemeToggleButtonProps) {
  const { mode, toggleTheme } = useTheme();

  return (
    <Button
      type="text"
      icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
      onClick={toggleTheme}
      size={size}
      aria-label="Переключить тему"
    />
  );
}
