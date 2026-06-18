import React from 'react';
import { useTheme } from '@/theme/ThemeContext';
import addedIcon from '@/static/bookmark/added.svg';
import darkAddedIcon from '@/static/bookmark/dark_added.svg';
import lightNotAddedIcon from '@/static/bookmark/light_not_added.svg';
import notAddedIcon from '@/static/bookmark/not_added.svg';

interface BookmarkToggleIconProps {
  /** Whether the document/quote is currently bookmarked. */
  bookmarked: boolean;
  /** Called when the icon is activated. */
  onToggle?: () => void;
  /** Whether a toggle operation is in progress. */
  loading?: boolean;
  /** Rendered icon size in px (square). Defaults to 44. */
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Единая иконка-лента закладки. Использует готовые SVG из макета и сама
 * подбирает нужный вариант под состояние (добавлено/нет) и тему (светлая/тёмная).
 * Если передан `onToggle`, рендерится как кликабельная кнопка-переключатель.
 */
export function BookmarkToggleIcon({
  bookmarked,
  onToggle,
  loading = false,
  size = 44,
  style,
  className,
}: BookmarkToggleIconProps) {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const src = bookmarked
    ? isDark
      ? darkAddedIcon
      : addedIcon
    : isDark
      ? notAddedIcon
      : lightNotAddedIcon;

  const img = (
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      style={{ width: size, height: size, display: 'block' }}
    />
  );

  if (!onToggle) {
    return (
      <span className={className} style={{ display: 'inline-flex', ...style }}>
        {img}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={bookmarked ? 'Убрать из закладок' : 'Добавить в закладки'}
      aria-pressed={bookmarked}
      disabled={loading}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!loading) {
          onToggle();
        }
      }}
      style={{
        padding: 0,
        border: 'none',
        background: 'transparent',
        lineHeight: 0,
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.2s ease, transform 0.15s ease',
        ...style,
      }}
    >
      {img}
    </button>
  );
}
