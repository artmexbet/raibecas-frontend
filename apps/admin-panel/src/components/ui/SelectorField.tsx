import { memo, type ReactNode } from 'react';
import { RightOutlined } from '@ant-design/icons';

interface SelectorFieldProps {
  icon?: ReactNode;
  label?: ReactNode;
  placeholder: ReactNode;
  value?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  footer?: ReactNode;
  ariaLabel?: string;
}

const rootStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '12px 16px',
  background: 'var(--surface)',
  border: '1px solid var(--hairline)',
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'border-color 120ms ease, box-shadow 120ms ease',
  textAlign: 'left' as const,
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: 'var(--ink-900)',
  minHeight: 52,
};

const iconWrap = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 34,
  height: 34,
  borderRadius: 6,
  background: 'var(--paper)',
  color: 'var(--ochre-deep)',
  flexShrink: 0,
  fontSize: 16,
} as const;

/**
 * A ghost-styled button that sits where an Ant `Select` would be, but opens a
 * dedicated modal for richer picking flows (authors, categories, tags, ...).
 */
export const SelectorField = memo(function SelectorField({
  icon,
  label,
  placeholder,
  value,
  onClick,
  disabled,
  loading,
  footer,
  ariaLabel,
}: SelectorFieldProps) {
  const isEmpty = value == null || value === '';
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        style={{
          ...rootStyle,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ochre)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--hairline)';
        }}
      >
        {icon && <span style={iconWrap}>{icon}</span>}
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
          {label && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-400)',
              }}
            >
              {label}
            </span>
          )}
          <span
            style={{
              fontSize: 15,
              color: isEmpty ? 'var(--ink-400)' : 'var(--ink-900)',
              fontStyle: isEmpty ? 'italic' : 'normal',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Загружается…' : isEmpty ? placeholder : value}
          </span>
        </span>
        <RightOutlined style={{ color: 'var(--ink-300)', fontSize: 12 }} />
      </button>
      {footer && <div style={{ marginTop: 8 }}>{footer}</div>}
    </div>
  );
});
