import type { ThemeConfig } from 'antd';

/**
 * Centralised theme for the admin panel — editorial academic direction.
 *
 * Palette: deep ink navy on warm cream paper, ochre accent, burgundy danger.
 * The CSS-variable twins live in `src/index.css` (--ink-900, --ochre, …) so
 * that custom styling stays in sync with Ant Design's token engine.
 */

const PALETTE = {
  inkPrimary: '#16233d',
  inkSecondary: '#5a6578',
  ochre: '#b4884a',
  burgundy: '#8b2a2a',
  forest: '#2d6a4f',
  amber: '#c08f2c',
  paper: '#f7f2e6',
  paperSoft: '#fbf8ef',
  surface: '#ffffff',
  hairline: '#e6dfca',
} as const;

const FONT_BODY =
  "'IBM Plex Sans', 'SF Pro Text', 'Segoe UI', system-ui, sans-serif";

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: PALETTE.inkPrimary,
    colorInfo: PALETTE.inkPrimary,
    colorSuccess: PALETTE.forest,
    colorWarning: PALETTE.amber,
    colorError: PALETTE.burgundy,

    colorText: PALETTE.inkPrimary,
    colorTextBase: PALETTE.inkPrimary,
    colorTextSecondary: PALETTE.inkSecondary,
    colorTextTertiary: '#7b8497',

    colorBgBase: PALETTE.paper,
    colorBgContainer: PALETTE.surface,
    colorBgLayout: PALETTE.paper,
    colorBgElevated: PALETTE.surface,

    colorBorder: PALETTE.hairline,
    colorBorderSecondary: '#efe8d4',

    borderRadius: 6,
    borderRadiusLG: 10,
    borderRadiusSM: 4,

    fontFamily: FONT_BODY,
    fontSize: 14,
    fontSizeHeading1: 36,
    fontSizeHeading2: 28,
    fontSizeHeading3: 22,
    fontSizeHeading4: 18,
    fontSizeHeading5: 16,

    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,

    wireframe: false,
  },

  components: {
    Layout: {
      headerBg: PALETTE.surface,
      bodyBg: PALETTE.paper,
      siderBg: PALETTE.inkPrimary,
      triggerBg: '#0f1a2e',
    },

    Menu: {
      darkItemBg: PALETTE.inkPrimary,
      darkSubMenuItemBg: '#0f1a2e',
      darkItemSelectedBg: PALETTE.ochre,
      darkItemHoverBg: '#27344f',
      darkItemColor: 'rgba(247,242,230,0.72)',
      darkItemSelectedColor: '#fff',
      darkItemHoverColor: '#fff',
    },

    Card: {
      colorBgContainer: PALETTE.surface,
      borderRadiusLG: 10,
      headerHeight: 52,
      headerFontSize: 18,
    },

    Button: {
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      fontWeight: 500,
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },

    Input: {
      controlHeight: 36,
      controlHeightLG: 44,
      paddingBlockLG: 10,
    },

    Table: {
      headerBg: PALETTE.paperSoft,
      headerColor: PALETTE.inkSecondary,
      rowHoverBg: PALETTE.paperSoft,
      borderColor: PALETTE.hairline,
    },

    Tag: {
      defaultBg: '#f3efe2',
      defaultColor: PALETTE.inkSecondary,
    },

    Modal: {
      contentBg: PALETTE.surface,
      headerBg: PALETTE.surface,
      borderRadiusLG: 12,
    },

    Tabs: {
      itemColor: PALETTE.inkSecondary,
      itemActiveColor: PALETTE.inkPrimary,
      itemHoverColor: PALETTE.inkPrimary,
      itemSelectedColor: PALETTE.inkPrimary,
      inkBarColor: PALETTE.ochre,
    },

    Statistic: {
      contentFontSize: 28,
      titleFontSize: 12,
    },

    Alert: {
      colorInfoBg: '#eef0f6',
      colorWarningBg: '#faf0d8',
      colorSuccessBg: '#e4f0e7',
      colorErrorBg: '#f6dcd8',
    },

    Select: {
      controlHeight: 36,
      controlHeightLG: 44,
    },
  },
};

/**
 * Accent palette for dashboard stat-cards — editorial colour chips.
 */
export const statisticCardColors = {
  documents: { accent: PALETTE.inkPrimary, tint: '#eef0f6' },
  users: { accent: PALETTE.forest, tint: '#e4f0e7' },
  requests: { accent: PALETTE.ochre, tint: '#f3e6c6' },
  notes: { accent: PALETTE.burgundy, tint: '#f6dcd8' },
} as const;

/** Colours used for small charts/accents throughout the admin panel. */
export const statisticColors = {
  views: PALETTE.inkPrimary,
  notes: PALETTE.ochre,
} as const;

export const palette = PALETTE;
