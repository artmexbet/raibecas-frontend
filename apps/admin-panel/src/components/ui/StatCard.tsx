import { memo, type ReactNode } from 'react';

interface StatCardProps {
  eyebrow: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: string;
  tint?: string;
}

/**
 * Editorial stat card — accent hairline on top, large serif numeral, quiet
 * uppercase eyebrow. Used on the dashboard.
 */
export const StatCard = memo(function StatCard({
  eyebrow,
  value,
  hint,
  icon,
  accent = 'var(--ink-900)',
  tint = 'var(--paper-soft)',
}: StatCardProps) {
  return (
    <article
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        padding: '22px 22px 20px',
        overflow: 'hidden',
        minHeight: 132,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accent,
        }}
        aria-hidden
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span
          className="eyebrow"
          style={{ color: 'var(--ink-500)', fontSize: 10, letterSpacing: '0.2em' }}
        >
          {eyebrow}
        </span>
        {icon && (
          <span
            aria-hidden
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 6,
              background: tint,
              color: accent,
              fontSize: 16,
            }}
          >
            {icon}
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 44,
          fontWeight: 500,
          lineHeight: 1,
          color: 'var(--ink-900)',
          letterSpacing: '-0.03em',
          fontVariationSettings: "'opsz' 144, 'SOFT' 60",
          marginTop: 16,
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: 'var(--ink-500)',
            fontStyle: 'italic',
            fontFamily: 'var(--font-display)',
          }}
        >
          {hint}
        </div>
      )}
    </article>
  );
});
