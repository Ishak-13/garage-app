import React from 'react';

interface GarageLogoProps {
  /**
   * 'full' shows both the CAG shield and the text CITY AUTO GARAGE.
   * 'shield' shows only the red shield emblem.
   */
  variant?: 'full' | 'shield';
  /**
   * Colors for 'CITY AUTO' text.
   * 'dark' (default): dark slate/charcoal.
   * 'light': clean white (ideal for dark backgrounds).
   */
  textColor?: 'dark' | 'light';
  height?: string | number;
  className?: string;
}

export const GarageLogo: React.FC<GarageLogoProps> = ({
  variant = 'full',
  textColor = 'dark',
  height = '100%',
  className = '',
}) => {
  // Brand Colors
  const accentRed = '#e31e24';
  const textFill = textColor === 'light' ? '#ffffff' : '#041627';

  if (variant === 'shield') {
    return (
      <svg
        viewBox="0 0 280 180"
        height={height}
        className={`inline-block select-none ${className}`}
        style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Shield Backing */}
        <path
          d="M 10,10 L 270,10 Q 270,35 270,110 L 140,170 L 10,110 Q 10,35 10,10 Z"
          fill={accentRed}
        />

        {/* Inner Border Lining */}
        <path
          d="M 18,18 L 262,18 Q 262,40 262,106 L 140,162 L 18,106 Q 18,40 18,18 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeOpacity="0.85"
        />

        {/* Horizontal dashes inside on the bottom left and right */}
        <path d="M 32,125 H 44" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 236,125 H 248" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

        {/* CAG Text - Heavy Sans-Serif */}
        <text
          x="140"
          y="92"
          fill="#ffffff"
          fontWeight="900"
          fontSize="66px"
          fontFamily="'Inter', system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="1"
        >
          CAG
        </text>

        {/* Separator lines flanking 'EST. GUNTUR' */}
        <line x1="32" y1="140" x2="68" y2="140" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.6" />
        <line x1="212" y1="140" x2="248" y2="140" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.6" />

        {/* EST. GUNTUR text */}
        <text
          x="140"
          y="144"
          fill="#ffffff"
          fontWeight="700"
          fontSize="11.5px"
          fontFamily="'Inter', system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="3"
        >
          EST. GUNTUR
        </text>
      </svg>
    );
  }

  // Horizontal "Full Logo" Layout
  return (
    <svg
      viewBox="0 0 640 180"
      height={height}
      className={`inline-block select-none ${className}`}
      style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Shield Area (Sits from x=0 to x=240) */}
      <g transform="translate(0, 0)">
        {/* Outer Shield Backing */}
        <path
          d="M 10,10 L 230,10 Q 230,35 230,110 L 120,170 L 10,110 Q 10,35 10,10 Z"
          fill={accentRed}
        />

        {/* Inner Border Lining */}
        <path
          d="M 18,18 L 222,18 Q 222,40 222,106 L 120,162 L 18,106 Q 18,40 18,18 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeOpacity="0.85"
        />

        {/* Side Horizontal dashes */}
        <path d="M 30,125 H 40" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 200,125 H 210" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

        {/* CAG Text */}
        <text
          x="120"
          y="92"
          fill="#ffffff"
          fontWeight="900"
          fontSize="58px"
          fontFamily="'Inter', system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="1"
        >
          CAG
        </text>

        {/* Flanking lines */}
        <line x1="30" y1="140" x2="60" y2="140" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="180" y1="140" x2="210" y2="140" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />

        {/* EST. GUNTUR text */}
        <text
          x="120"
          y="144"
          fill="#ffffff"
          fontWeight="700"
          fontSize="10px"
          fontFamily="'Inter', system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="2.5"
        >
          EST. GUNTUR
        </text>
      </g>

      {/* 2. Text Branding Area (Sits from x=260 to x=630) */}
      <text
        x="260"
        y="60"
        fill={textFill}
        fontWeight="900"
        fontSize="44px"
        fontFamily="'Inter', system-ui, -apple-system, sans-serif"
        letterSpacing="0.5"
      >
        CITY
      </text>

      <text
        x="260"
        y="108"
        fill={textFill}
        fontWeight="900"
        fontSize="44px"
        fontFamily="'Inter', system-ui, -apple-system, sans-serif"
        letterSpacing="0.5"
      >
        AUTO
      </text>

      {/* G A R A G E in Red and spaced out */}
      <text
        x="260"
        y="144"
        fill={accentRed}
        fontWeight="700"
        fontSize="24px"
        fontFamily="'Inter', system-ui, -apple-system, sans-serif"
        letterSpacing="11"
      >
        GARAGE
      </text>

      {/* Solid Red Baseline under GARAGE that extends to the right margin of the logo */}
      <line
        x1="260"
        y1="158"
        x2="610"
        y2="158"
        stroke={accentRed}
        strokeWidth="4.5"
        strokeLinecap="square"
      />
    </svg>
  );
};
