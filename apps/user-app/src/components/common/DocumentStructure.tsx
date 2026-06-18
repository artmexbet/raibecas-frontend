import React from 'react';
import { Empty, Typography, theme } from 'antd';
import type { TocEntry } from '@/utils/markdownToc';

const { Text } = Typography;

interface DocumentStructureProps {
  toc: TocEntry[];
  activeId?: string | null;
  onNavigate: (entry: TocEntry) => void;
  /** Заголовок панели. На мобильном drawer'е свой заголовок не нужен. */
  showHeading?: boolean;
}

/**
 * Список заголовков документа с переходом к выбранной точке.
 * Отступ слева отражает уровень заголовка, активный пункт подсвечивается.
 */
export function DocumentStructure({ toc, activeId, onNavigate, showHeading = true }: DocumentStructureProps) {
  const { token } = theme.useToken();

  if (toc.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="В документе нет заголовков"
        style={{ marginTop: 24 }}
      />
    );
  }

  // Минимальный уровень используем как базовый, чтобы документы, начинающиеся
  // с ## (без единственного h1), не выглядели смещёнными.
  const minLevel = toc.reduce((min, entry) => Math.min(min, entry.level), 6);

  return (
    <nav aria-label="Структура документа">
      {showHeading ? (
        <Text strong style={{ display: 'block', fontSize: 16, marginBottom: 16 }}>
          Структура документа
        </Text>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {toc.map((entry) => {
          const isActive = entry.id === activeId;

          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onNavigate(entry)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 8,
                padding: '7px 10px',
                paddingLeft: 10 + (entry.level - minLevel) * 14,
                fontSize: 14,
                lineHeight: 1.4,
                color: isActive ? token.colorPrimary : token.colorText,
                fontWeight: isActive || entry.level === minLevel ? 600 : 400,
                background: isActive ? token.colorPrimaryBg : 'transparent',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(event) => {
                if (!isActive) {
                  event.currentTarget.style.background = token.colorFillTertiary;
                }
              }}
              onMouseLeave={(event) => {
                if (!isActive) {
                  event.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {entry.text}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
