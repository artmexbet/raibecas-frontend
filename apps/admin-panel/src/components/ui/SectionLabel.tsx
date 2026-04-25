import { memo, type ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
  hint?: ReactNode;
  as?: 'h2' | 'h3' | 'div';
  marginTop?: number;
}

const HIDDEN_STYLES = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 14,
  marginBottom: 16,
} as const;

/**
 * Italic serif section headline for form blocks and card interiors.
 * Doubles as a subtle visual rhythm element between groups of fields.
 */
export const SectionLabel = memo(function SectionLabel({
  children,
  hint,
  as: Tag = 'h3',
  marginTop = 0,
}: SectionLabelProps) {
  return (
    <div style={{ ...HIDDEN_STYLES, marginTop }}>
      <Tag
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 18,
          color: 'var(--ink-800)',
          letterSpacing: '-0.005em',
        }}
      >
        {children}
      </Tag>
      <div
        style={{
          flex: 1,
          height: 1,
          background: 'var(--hairline)',
          transform: 'translateY(-4px)',
        }}
      />
      {hint && (
        <span
          style={{
            fontSize: 12,
            color: 'var(--ink-400)',
            fontStyle: 'italic',
            flexShrink: 0,
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
});
