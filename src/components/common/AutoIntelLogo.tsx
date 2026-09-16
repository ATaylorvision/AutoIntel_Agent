import React from 'react';

export interface AutoIntelLogoProps {
  /**
   * 'mark': emblem symbol only
   * 'full': stacked emblem + AUTO INTEL + — AGENT —
   * 'horizontal': emblem on left, AUTO INTEL + AGENT on right
   */
  variant?: 'mark' | 'full' | 'horizontal';
  /**
   * 'light': for light backgrounds (AUTO in dark slate, INTEL in purple)
   * 'dark': for dark backgrounds (AUTO in white, INTEL in lilac)
   */
  theme?: 'light' | 'dark';
  /**
   * Size presets or custom class
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const AutoIntelLogo: React.FC<AutoIntelLogoProps> = ({
  variant = 'horizontal',
  theme = 'light',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  const isDark = theme === 'dark';
  const autoColor = isDark ? '#FFFFFF' : '#0F172A';
  const intelColor = isDark ? '#C084FC' : '#9333EA';
  const swooshColor = isDark ? '#A855F7' : '#8B5CF6';
  const faintAColor = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(15, 23, 42, 0.15)';
  const secondaryStroke = isDark ? 'rgba(192, 132, 252, 0.4)' : 'rgba(147, 51, 234, 0.3)';
  const agentColor = isDark ? '#94A3B8' : '#64748B';

  // Mark SVG Emblem Component
  const renderEmblem = (emblemSizeClass: string) => (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${emblemSizeClass} shrink-0 transition-transform duration-200`}
    >
      <defs>
        <linearGradient id="swooshGrad" x1="20" y1="120" x2="140" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={swooshColor} stopOpacity="0.85" />
          <stop offset="60%" stopColor={intelColor} />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <linearGradient id="iPillarGrad" x1="105" y1="36" x2="115" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
      </defs>

      {/* Geometric 'A' apex background framework */}
      <path
        d="M62 38L32 122H50L58 100H88L94 116H100"
        stroke={faintAColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M62 38L88 100"
        stroke={faintAColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Subtle car roofline / aerodynamic contour in background */}
      <path
        d="M48 94C60 84 84 80 110 88"
        stroke={secondaryStroke}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M56 102C68 94 92 90 120 100"
        stroke={secondaryStroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Primary Aerodynamic Speed Swoosh / Fender curve wrapping across */}
      <path
        d="M24 82C22 70 36 60 56 54C78 48 102 50 116 68C124 78 126 94 108 98C82 104 46 108 32 94C26 88 24 84 24 82Z"
        fill="url(#swooshGrad)"
        fillOpacity="0.18"
      />
      <path
        d="M24 82C30 56 65 50 96 60C118 68 132 86 112 96C88 108 42 108 26 86"
        stroke="url(#swooshGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* The 'I' Pillar */}
      <rect
        x="104"
        y="38"
        width="16"
        height="84"
        rx="3"
        fill="url(#iPillarGrad)"
      />

      {/* Antenna / Spark Sensor accent projecting from top right of the 'I' */}
      <path
        d="M120 48H138"
        stroke="#A855F7"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="142"
        cy="48"
        r="4.5"
        fill="#A855F7"
      />
      <circle
        cx="142"
        cy="48"
        r="2"
        fill={isDark ? '#0F172A' : '#FFFFFF'}
      />
    </svg>
  );

  if (variant === 'mark') {
    const markSizes = {
      sm: 'w-7 h-7',
      md: 'w-9 h-9',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    };
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderEmblem(markSizes[size])}
      </div>
    );
  }

  if (variant === 'full') {
    const fullSizes = {
      sm: { emblem: 'w-16 h-16', title: 'text-lg', agent: 'text-[10px]' },
      md: { emblem: 'w-24 h-24', title: 'text-2xl', agent: 'text-xs' },
      lg: { emblem: 'w-32 h-32', title: 'text-3xl', agent: 'text-sm' },
      xl: { emblem: 'w-44 h-44', title: 'text-4xl', agent: 'text-base' },
    };
    const s = fullSizes[size];

    return (
      <div className={`inline-flex flex-col items-center text-center ${className}`}>
        {renderEmblem(s.emblem)}
        <div className="mt-2 tracking-wide">
          <div className={`${s.title} font-black tracking-widest uppercase flex items-center justify-center gap-2`}>
            <span style={{ color: autoColor }}>AUTO</span>
            <span style={{ color: intelColor }}>INTEL</span>
          </div>
          {showSubtitle && (
            <div className={`flex items-center justify-center gap-2.5 mt-1 ${s.agent} font-bold tracking-[0.25em] uppercase`}>
              <span className="w-6 h-[1.5px] rounded-full" style={{ backgroundColor: agentColor }} />
              <span style={{ color: agentColor }}>AGENT</span>
              <span className="w-6 h-[1.5px] rounded-full" style={{ backgroundColor: agentColor }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  const horizSizes = {
    sm: { emblem: 'w-7 h-7', title: 'text-base', agent: 'text-[9px]' },
    md: { emblem: 'w-9 h-9', title: 'text-lg', agent: 'text-[10px]' },
    lg: { emblem: 'w-12 h-12', title: 'text-xl', agent: 'text-xs' },
    xl: { emblem: 'w-14 h-14', title: 'text-2xl', agent: 'text-sm' },
  };
  const hs = horizSizes[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {renderEmblem(hs.emblem)}
      <div className="flex flex-col leading-none">
        <div className={`${hs.title} font-black tracking-wider uppercase flex items-baseline gap-1.5`}>
          <span style={{ color: autoColor }}>AUTO</span>
          <span style={{ color: intelColor }}>INTEL</span>
        </div>
        {showSubtitle && (
          <div className={`flex items-center gap-1.5 mt-1 ${hs.agent} font-bold tracking-[0.2em] uppercase`}>
            <span className="w-3 h-[1px]" style={{ backgroundColor: agentColor }} />
            <span style={{ color: agentColor }}>AGENT</span>
            <span className="w-3 h-[1px]" style={{ backgroundColor: agentColor }} />
          </div>
        )}
      </div>
    </div>
  );
};
