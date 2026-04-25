import { memo, type ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

const styles = {
  wrapper: {
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: '1px solid var(--hairline)',
  } as const,
  row: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 24,
    flexWrap: 'wrap',
  } as const,
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 0,
    flex: '1 1 320px',
  } as const,
  title: {
    margin: 0,
    fontFamily: 'var(--font-display)',
    fontSize: 34,
    fontWeight: 500,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    color: 'var(--ink-900)',
    fontVariationSettings: "'opsz' 144, 'SOFT' 40",
  } as const,
  description: {
    margin: 0,
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 15,
    color: 'var(--ink-500)',
    maxWidth: 640,
    lineHeight: 1.45,
  } as const,
  actions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  } as const,
};

/**
 * Editorial page header: small-caps eyebrow, serif display title, optional
 * italic description and trailing actions. Used at the top of every page.
 */
export const PageHeader = memo(function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <header style={styles.wrapper}>
      <div style={styles.row}>
        <div style={styles.titleBlock}>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 style={styles.title}>{title}</h1>
          {description && <p style={styles.description}>{description}</p>}
        </div>
        {actions && <div style={styles.actions}>{actions}</div>}
      </div>
      {children}
    </header>
  );
});
