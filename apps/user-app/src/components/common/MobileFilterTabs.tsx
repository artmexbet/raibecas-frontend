import React from 'react';
import { theme } from 'antd';

export interface MobileFilterTab {
  key: string;
  label: string;
}

interface MobileFilterTabsProps {
  tabs: MobileFilterTab[];
  activeKey: string;
  onChange: (key: string) => void;
}

/**
 * Строка фильтров-вкладок «Все | X | Y» для мобильной вёрстки.
 */
export function MobileFilterTabs({ tabs, activeKey, onChange }: MobileFilterTabsProps) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 10,
        padding: '4px 0 16px',
      }}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.key === activeKey;

        return (
          <React.Fragment key={tab.key}>
            {index > 0 ? <span style={{ color: token.colorTextTertiary }}>|</span> : null}
            <button
              type="button"
              onClick={() => onChange(tab.key)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontSize: 15,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? token.colorText : token.colorTextSecondary,
                textDecoration: isActive ? 'underline' : 'none',
                textUnderlineOffset: 4,
              }}
            >
              {tab.label}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
