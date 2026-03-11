import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 180, height = 40, className }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Signature style text */}
      <text
        x="10"
        y="28"
        fontFamily="cursive"
        fontSize="24"
        fontStyle="italic"
        fill="currentColor"
      >
        Аввакум
      </text>
      {/* РАЙБЕКАС text */}
      <text
        x="85"
        y="28"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="20"
        fontWeight="300"
        letterSpacing="0.15em"
        fill="currentColor"
      >
        РАЙБЕКАС
      </text>
    </svg>
  );
}
