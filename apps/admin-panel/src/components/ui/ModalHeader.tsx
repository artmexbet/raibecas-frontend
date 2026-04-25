import { memo, type ReactNode } from 'react';

interface ModalHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  hint?: ReactNode;
}

/**
 * Editorial modal title: small uppercase eyebrow + italic serif title.
 * Used inside <Modal title={<ModalHeader …/>}>.
 */
export const ModalHeader = memo(function ModalHeader({
  eyebrow,
  title,
  hint,
}: ModalHeaderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {eyebrow && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ochre-deep)',
          }}
        >
          {eyebrow}
        </span>
      )}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 20,
          color: 'var(--ink-900)',
          letterSpacing: '-0.005em',
        }}
      >
        {title}
      </span>
      {hint && (
        <span
          style={{
            fontSize: 12,
            color: 'var(--ink-500)',
            marginTop: 2,
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
});
