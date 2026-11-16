import React from 'react'

export default function TeaCeremonyHeroArt({ className = '', width = 320, height = 180 }) {
  return (
    <svg
      viewBox="0 0 320 180"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${className}`}
      role="img"
      aria-label="TeaMap Botanical Ceremony & Terraced Plantations Illustration"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="teaGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="teaJadeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Gradients */}
        <linearGradient id="teaJadeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4F6F52" />
          <stop offset="100%" stopColor="#1C2A22" />
        </linearGradient>
        <linearGradient id="teaGoldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#DDB36B" />
          <stop offset="100%" stopColor="#C08A34" />
        </linearGradient>
        <linearGradient id="teaPorcelainGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FAF7F0" />
          <stop offset="100%" stopColor="#E7E0CC" />
        </linearGradient>
        <linearGradient id="teaInfusionGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0BB5C" />
          <stop offset="100%" stopColor="#A9682E" />
        </linearGradient>
      </defs>

      {/* Terraced Plantation Contour Curves (Topography) */}
      <path
        d="M-20 130 C 60 110, 120 145, 200 120 C 260 100, 310 125, 340 115"
        stroke="#4F6F52"
        strokeOpacity="0.25"
        strokeWidth="1.2"
        strokeDasharray="4 4"
        fill="none"
      />
      <path
        d="M-10 150 C 70 135, 140 160, 220 140 C 280 125, 320 145, 340 138"
        stroke="#C08A34"
        strokeOpacity="0.2"
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="160" cy="90" r="75" fill="none" stroke="#C08A34" strokeOpacity="0.1" strokeWidth="1" />

      {/* Central Botanical Vessel: Porcelain Gaiwan / Chawan */}
      <g transform="translate(115, 60)">
        {/* Gaiwan Saucer */}
        <ellipse cx="45" cy="86" rx="42" ry="8" fill="url(#teaPorcelainGrad)" stroke="#C08A34" strokeWidth="1" />

        {/* Gaiwan Bowl */}
        <path
          d="M12 40 C 14 74, 30 84, 45 84 C 60 84, 76 74, 78 40 Z"
          fill="url(#teaPorcelainGrad)"
          stroke="#1C2A22"
          strokeWidth="1.2"
        />

        {/* Tea Liquor / Infusion Surface */}
        <ellipse cx="45" cy="48" rx="28" ry="7" fill="url(#teaInfusionGrad)" filter="url(#teaGoldGlow)" />

        {/* Floating Camellia Sinensis tea leaf */}
        <path
          d="M40 47 C 43 44, 50 45, 52 48 C 48 51, 42 50, 40 47 Z"
          fill="#4F6F52"
        />
        <line x1="41" y1="47.5" x2="51" y2="47.5" stroke="#FAF7F0" strokeWidth="0.5" strokeOpacity="0.7" />

        {/* Gaiwan Lid Slightly Tilted */}
        <g transform="translate(0, -6) rotate(-8 45 34)">
          <path
            d="M14 36 C 24 24, 66 24, 76 36 C 60 38, 30 38, 14 36 Z"
            fill="url(#teaPorcelainGrad)"
            stroke="#C08A34"
            strokeWidth="1"
          />
          {/* Lid Knob with Gold Finial */}
          <ellipse cx="45" cy="24" rx="7" ry="3.5" fill="url(#teaGoldGrad)" />
        </g>

        {/* Rising Fragrant Tea Steam (Delicate lines) */}
        <path
          d="M38 18 C 36 10, 44 6, 40 -2"
          stroke="#FAF7F0"
          strokeOpacity="0.45"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M50 20 C 53 12, 47 7, 51 0"
          stroke="#DDB36B"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Fresh Botanical Tea Leaves on the Left */}
      <g transform="translate(38, 55)">
        {/* Leaf Stem */}
        <path d="M10 65 Q 26 40 38 20" stroke="#4F6F52" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Terminal Leaf bud */}
        <path
          d="M38 20 C 44 14, 48 8, 48 4 C 44 8, 40 14, 38 20 Z"
          fill="#7FA579"
          stroke="#4F6F52"
          strokeWidth="0.8"
        />
        {/* First Leaf */}
        <path
          d="M32 30 C 46 26, 52 35, 48 44 C 40 42, 34 36, 32 30 Z"
          fill="#4F6F52"
          filter="url(#teaJadeGlow)"
        />
        {/* Second Leaf */}
        <path
          d="M20 45 C 8 40, 4 52, 10 60 C 18 57, 19 48, 20 45 Z"
          fill="#3B533E"
        />
      </g>

      {/* Origin Stamp Seal on the Right: Red/Gold Chinese Seal Style */}
      <g transform="translate(242, 48)">
        <rect
          width="48"
          height="48"
          rx="10"
          fill="#1C2A22"
          stroke="#C08A34"
          strokeWidth="1.5"
        />
        <circle cx="24" cy="24" r="18" fill="none" stroke="#C08A34" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />
        <text x="24" y="22" fill="#DDB36B" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="serif">茶</text>
        <text x="24" y="34" fill="#FAF7F0" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ATLAS</text>
      </g>

      {/* Floating Sparkles and Golden Aroma Particles */}
      <circle cx="95" cy="40" r="1.5" fill="#DDB36B" opacity="0.8" />
      <circle cx="160" cy="30" r="2" fill="#DDB36B" opacity="0.9" />
      <circle cx="225" cy="36" r="1.5" fill="#DDB36B" opacity="0.7" />
      <circle cx="185" cy="24" r="1" fill="#FAF7F0" opacity="0.6" />
    </svg>
  )
}
