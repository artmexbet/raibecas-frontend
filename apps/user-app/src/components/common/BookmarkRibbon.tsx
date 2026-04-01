import React from 'react';

interface BookmarkRibbonProps {
  background?: string;
}

export function BookmarkRibbon({ background = '#6a3d35' }: BookmarkRibbonProps) {
  return (
    <div
      aria-hidden
      style={{
        width: 46,
        height: 64,
        background,
        borderRadius: '8px 8px 0 0',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)',
        boxShadow: '0 10px 24px rgba(76, 44, 39, 0.18)',
      }}
    />
  );
}

