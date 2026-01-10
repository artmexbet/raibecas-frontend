import type { ThemeConfig } from 'antd';

/**
 * Централизованная конфигурация темы для всего приложения
 * Используется Ant Design ConfigProvider для применения темы глобально
 */
export const appTheme: ThemeConfig = {
  token: {
    // Основные цвета
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',

    // Цвета текста
    colorTextBase: '#262626',
    colorTextSecondary: '#8c8c8c',

    // Фоновые цвета
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',

    // Радиусы скругления
    borderRadius: 6,

    // Размеры шрифтов
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // Отступы
    marginXS: 8,
    marginSM: 12,
    margin: 16,
    marginMD: 20,
    marginLG: 24,
    marginXL: 32,
    marginXXL: 48,
  },

  components: {
    // Настройки для компонента Card
    Card: {
      colorBgContainer: '#ffffff',
      borderRadiusLG: 8,
    },

    // Настройки для компонента Statistic
    Statistic: {
      contentFontSize: 24,
      titleFontSize: 14,
    },

    // Настройки для компонента Button
    Button: {
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
    },

    // Настройки для компонента Table
    Table: {
      headerBg: '#fafafa',
      headerColor: '#262626',
    },
  },
};

/**
 * Кастомные цвета для статистических карточек
 */
export const statisticCardColors = {
  time: {
    background: '#f0f5ff',
    color: '#1890ff',
  },
  users: {
    background: '#f6ffed',
    color: '#52c41a',
  },
  repeats: {
    background: '#fff7e6',
    color: '#faad14',
  },
  date: {
    background: '#fafafa',
    color: '#262626',
  },
};

/**
 * Цвета для статистики просмотров
 */
export const statisticColors = {
  views: '#1890ff',
  notes: '#52c41a',
};

