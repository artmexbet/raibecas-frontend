import React from 'react';
import podpisSvg from '../../wright.svg';

interface PageBackgroundProps {
  opacity?: number;
}

/**
 * Подпись-фон на всю страницу (podpis.svg)
 */
export function PageBackground({ opacity = 0.05 }: PageBackgroundProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={podpisSvg}
        alt=""
        aria-hidden="true"
        style={{
          width: '90%',
          maxWidth: 1200,
          height: 'auto',
          opacity,
          userSelect: 'none',
        }}
      />
    </div>
  );
}



