import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

// Расширяем стандартные токены Ant Design собственным токеном
declare module 'antd/es/theme/interface' {
  interface AliasToken {
    /** Фон навигационной «таблетки» в хедере */
    colorBgNav: string;
    /** Фон выбранного пункта навигации в хедере */
    colorBgNavActive: string;
    /** Фон боковой панели (aside) с прозрачностью — меняется с темой */
    colorBgSidebar: string;
    /** Полупрозрачный фон sidebar чата */
    colorBgChatSidebar: string;
    /** Основная подложка карточек чата */
    colorBgChatSurface: string;
    /** Фон composer чата */
    colorBgChatComposer: string;
    /** Фон чипов в composer/sidebar */
    colorBgChatChip: string;
    /** Hover-фон чипов в composer/sidebar */
    colorBgChatChipHover: string;
    /** Фон пользовательского сообщения */
    colorBgChatBubbleUser: string;
    /** Фон ответа ассистента */
    colorBgChatBubbleAssistant: string;
    /** Граница пользовательского пузыря */
    colorBorderChatBubbleUser: string;
    /** Тень chat-панелей и bubble */
    boxShadowChatSoft: string;
    /** Радиус основных панелей чата */
    borderRadiusChatPanel: number;
    /** Радиус пузырей сообщений */
    borderRadiusChatBubble: number;
  }
}

export type ThemeMode = 'light' | 'dark';

/**
 * Дефолтный режим темы.
 */
export const DEFAULT_THEME_MODE: ThemeMode = 'light';

/**
 * Цветовая палитра приложения
 */
export const palette = {
  // Backgrounds
  darkBg: '#190C0E',
  lightBg: '#EEEAE7',
  cardDark: '#2A1518',
  cardLight: '#FFFFFF',

  // Text
  textOnDark: '#FFFBF8',
  textOnLight: '#1E1012',

  // Accent (бордовый)
  accent: '#8B3A4A',
  accentHover: '#A04455',
  accentLight: '#C97B8A',

  // Borders
  borderLight: '#DDD8D4',
  borderDark: '#3D2226',

  transparent: 'transparent',

  // UI panels
  /** Белый 50% прозрачности — фон aside-панелей в светлой теме */
  sidebarBgLight: '#FFFFFF80',
  /** Тёмно-бордовый 50% прозрачности — фон aside-панелей в тёмной теме */
  sidebarBgDark: '#2A151880',
} as const;

/**
 * Базовые токены темы
 */
const baseTokens: ThemeConfig['token'] = {
  // Primary color - бордовый акцент
  colorPrimary: palette.accent,
  colorPrimaryHover: palette.accentHover,
  colorPrimaryActive: '#6B2A3A',

  // Status colors
  colorSuccess: '#52a97a',
  colorWarning: '#c9933a',
  colorError: '#c94040',
  colorInfo: palette.accent,

  // Border radius
  borderRadius: 12,
  borderRadiusLG: 16,
  borderRadiusSM: 8,
  borderRadiusXS: 4,

  // Typography
  fontSize: 14,
  fontSizeLG: 16,
  fontSizeSM: 12,
  fontSizeHeading1: 36,
  fontSizeHeading2: 28,
  fontSizeHeading3: 22,
  fontSizeHeading4: 18,
  fontSizeHeading5: 15,

  // Spacing
  marginXS: 4,
  marginSM: 8,
  margin: 16,
  marginMD: 20,
  marginLG: 24,
  marginXL: 32,
  marginXXL: 48,

  paddingXS: 4,
  paddingSM: 8,
  padding: 16,
  paddingMD: 20,
  paddingLG: 24,
  paddingXL: 32,
};

/**
 * Светлая тема
 */
export const lightTheme: ThemeConfig = {
  token: {
    ...baseTokens,
    // Backgrounds
    colorBgLayout: palette.lightBg,
    colorBgContainer: palette.transparent,
    colorBgElevated: '#FAF7F4',
    colorBgSpotlight: palette.cardLight,

    // Text
    colorText: palette.textOnLight,
    colorTextSecondary: '#6B5B5D',
    colorTextTertiary: '#9A8A8C',

    // Borders
    colorBorder: palette.borderLight,
    colorBorderSecondary: '#E8E4E0',

    // Fill
    colorFill: '#F5F2EF',
    colorFillSecondary: '#F0EBE7',
    colorFillTertiary: '#E8E4E0',
    colorFillQuaternary: '#DDD8D4',

    // Custom tokens
    colorBgNav: '#FFFFFF',
    colorBgNavActive: '#DCD3D0',
    colorBgSidebar: palette.sidebarBgLight,
    colorBgChatSidebar: 'rgba(255, 255, 255, 0.42)',
    colorBgChatSurface: 'rgba(255, 255, 255, 0.7)',
    colorBgChatComposer: 'rgba(255, 255, 255, 0.94)',
    colorBgChatChip: 'rgba(219, 208, 202, 0.9)',
    colorBgChatChipHover: 'rgba(207, 193, 185, 0.94)',
    colorBgChatBubbleUser: 'rgba(255, 255, 255, 0.96)',
    colorBgChatBubbleAssistant: 'rgba(220, 210, 205, 0.9)',
    colorBorderChatBubbleUser: 'rgba(30, 16, 18, 0.08)',
    boxShadowChatSoft: '0 18px 44px rgba(31, 24, 20, 0.08)',
    borderRadiusChatPanel: 16,
    borderRadiusChatBubble: 14,
  },
  components: {
    Layout: {
      headerBg: 'transparent',
      bodyBg: palette.lightBg,
      siderBg: palette.cardLight,
      footerBg: 'transparent',
    },
    Card: {
      colorBgContainer: palette.cardLight,
      borderRadiusLG: 16,
      boxShadow: '0 2px 8px rgba(30, 16, 18, 0.06)',
      boxShadowSecondary: '0 4px 16px rgba(30, 16, 18, 0.08)',
      boxShadowTertiary: '0 8px 32px rgba(30, 16, 18, 0.12)',
    },
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      borderRadius: 10,
      borderRadiusLG: 12,
    },
    Input: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      borderRadius: 10,
      colorBgContainer: palette.cardLight,
      colorBorder: palette.borderLight,
    },
    Menu: {
      colorBgContainer: palette.cardLight,
      itemBorderRadius: 8,
      itemHoverBg: '#F5F2EF',
      itemSelectedBg: `${palette.accent}14`,
      itemSelectedColor: palette.accent,
    },
    Tabs: {
      colorBgContainer: palette.cardLight,
      borderRadius: 12,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Tooltip: {
      borderRadius: 8,
    },
  },
};

/**
 * Тёмная тема
 */
export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...baseTokens,
    // Backgrounds
    colorBgLayout: palette.darkBg,
    colorBgContainer: palette.cardDark,
    colorBgElevated: '#321A1D',
    colorBgSpotlight: palette.cardDark,

    // Text
    colorText: palette.textOnDark,
    colorTextSecondary: '#C0A0A5',
    colorTextTertiary: '#8A6A6F',

    // Borders
    colorBorder: palette.borderDark,
    colorBorderSecondary: '#4A2A2E',

    // Fill
    colorFill: '#3D2226',
    colorFillSecondary: '#4A2A2E',
    colorFillTertiary: '#5A3A3E',
    colorFillQuaternary: '#6A4A4E',

    // Primary overrides for dark
    colorPrimary: palette.accent,
    colorPrimaryHover: palette.accentHover,

    // Custom tokens
    colorBgNav: palette.cardDark,
    colorBgNavActive: '#4A2A2E',
    colorBgSidebar: palette.sidebarBgDark,
    colorBgChatSidebar: 'rgba(42, 21, 24, 0.66)',
    colorBgChatSurface: 'rgba(50, 26, 29, 0.82)',
    colorBgChatComposer: 'rgba(34, 17, 17, 0.92)',
    colorBgChatChip: 'rgba(90, 58, 62, 0.88)',
    colorBgChatChipHover: 'rgba(106, 74, 78, 0.92)',
    colorBgChatBubbleUser: 'rgba(50, 26, 29, 0.94)',
    colorBgChatBubbleAssistant: 'rgba(61, 34, 38, 0.92)',
    colorBorderChatBubbleUser: 'rgba(255,255,255,0.06)',
    boxShadowChatSoft: '0 18px 44px rgba(0, 0, 0, 0.34)',
    borderRadiusChatPanel: 16,
    borderRadiusChatBubble: 14,
  },
  components: {
    Layout: {
      headerBg: 'transparent',
      bodyBg: palette.darkBg,
      siderBg: palette.cardDark,
      footerBg: 'transparent',
    },
    Card: {
      colorBgContainer: palette.cardDark,
      borderRadiusLG: 16,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.4)',
      boxShadowTertiary: '0 8px 32px rgba(0, 0, 0, 0.5)',
    },
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      borderRadius: 10,
      borderRadiusLG: 12,
    },
    Input: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      borderRadius: 10,
      colorBgContainer: '#221111',
      colorBorder: palette.borderDark,
    },
    Menu: {
      colorBgContainer: palette.cardDark,
      itemBorderRadius: 8,
      itemHoverBg: '#3D2226',
      itemSelectedBg: `${palette.accent}26`,
      itemSelectedColor: palette.textOnDark,
    },
    Tabs: {
      colorBgContainer: palette.cardDark,
      borderRadius: 12,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Tooltip: {
      borderRadius: 8,
    },
  },
};

/**
 * Получить конфигурацию темы по режиму
 */
export function getThemeConfig(mode: ThemeMode): ThemeConfig {
  return mode === 'dark' ? darkTheme : lightTheme;
}
