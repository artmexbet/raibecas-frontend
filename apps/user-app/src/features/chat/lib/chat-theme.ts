import type { CSSProperties } from 'react';
import type { GlobalToken } from 'antd';

type ThemeToken = GlobalToken;

/**
 * Maps Ant Design chat tokens to the CSS custom properties consumed by the
 * shared chat stylesheet (`chat-page.css`). Used by both the full chat page
 * and the inline document chat panel so they share the exact same look.
 */
export function getChatThemeVars(token: ThemeToken): CSSProperties {
  return {
    ['--chat-text-primary' as string]: token.colorText,
    ['--chat-text-secondary' as string]: token.colorTextSecondary,
    ['--chat-placeholder' as string]: token.colorTextTertiary,
    ['--chat-border' as string]: token.colorBorderSecondary,
    ['--chat-divider' as string]: token.colorSplit,
    ['--chat-sidebar-bg' as string]: token.colorBgChatSidebar,
    ['--chat-surface-strong' as string]: token.colorBgChatSurface,
    ['--chat-composer-bg' as string]: token.colorBgChatComposer,
    ['--chat-chip-bg' as string]: token.colorBgChatChip,
    ['--chat-chip-bg-hover' as string]: token.colorBgChatChipHover,
    ['--chat-bubble-user' as string]: token.colorBgChatBubbleUser,
    ['--chat-bubble-user-border' as string]: token.colorBorderChatBubbleUser,
    ['--chat-bubble-assistant' as string]: token.colorBgChatBubbleAssistant,
    ['--chat-shadow-soft' as string]: token.boxShadowChatSoft,
  };
}
