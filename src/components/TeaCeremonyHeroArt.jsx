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
        <filter id="teaCeremonyGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="teaCeremonyJadeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Dynamic Theme Gradients */}
        <linearGradient id="teaGaiwanGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--surface)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--surface-2)" stopOpacity="1" />
        </linearGradient>

        <linearGradient id="teaJadeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--primary-hover)" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="teaGoldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-hover)" />
        </linearGradient>

        <linearGradient id="teaInfusionGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0BB5C" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>

        <radialGradient id="teaVesselGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--primary-soft)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--primary-soft)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Atmospheric Background Glow */}
      <circle cx="160" cy="95" r="70" fill="url(#teaVesselGlow)" />

      {/* Terraced Plantation Contour Curves (Wuyi / Alishan Mountains) */}
      <path
        d="M-20 135 C 50 115, 110 148, 185 125 C 245 105, 295 130, 340 120"
        stroke="var(--primary)"
        strokeOpacity="0.3"
        strokeWidth="1.2"
        strokeDasharray="4 4"
        fill="none"
      />
      <path
        d="M-10 155 C 65 140, 135 165, 210 145 C 270 130, 315 150, 340 142"
        stroke="var(--accent)"
        strokeOpacity="0.25"
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="160" cy="90" r="72" fill="none" stroke="var(--border)" strokeOpacity="0.6" strokeWidth="1" />

      {/* Central Botanical Vessel: Mindful Gaiwan (白瓷盖碗) */}
      <g transform="translate(115, 62)">
        {/* Gaiwan Saucer / Plate */}
        <ellipse
          cx="45"
          cy="85"
          rx="44"
          ry="9"
          fill="url(#teaGaiwanGrad)"
          stroke="var(--border)"
          strokeWidth="1.2"
        />
        <ellipse
          cx="45"
          cy="85"
          rx="32"
          ry="5.5"
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.4"
          strokeWidth="0.8"
        />

        {/* Gaiwan Main Body / Bowl */}
        <path
          d="M12 38 C 14 74, 30 84, 45 84 C 60 84, 76 74, 78 38 Z"
          fill="url(#teaGaiwanGrad)"
          stroke="var(--border)"
          strokeWidth="1.2"
        />

        {/* Tea Liquor / Infusion Surface with gentle pulse */}
        <g className="anim-liquor">
          <ellipse
            cx="45"
            cy="47"
            rx="29"
            ry="7.5"
            fill="url(#teaInfusionGrad)"
            filter="url(#teaCeremonyGoldGlow)"
          />
        </g>

        {/* Floating Camellia Sinensis tea leaf */}
        <g className="anim-leaf">
          <path
            d="M39 46 C 42 43, 50 44, 52 47 C 48 50, 41 49, 39 46 Z"
            fill="var(--primary)"
          />
          <line
            x1="40"
            y1="46.5"
            x2="51"
            y2="46.5"
            stroke="var(--surface)"
            strokeWidth="0.5"
            strokeOpacity="0.8"
          />
        </g>

        {/* Gaiwan Lid Slightly Tilted to release fragrant aroma */}
        <g transform="translate(0, -6) rotate(-7 45 34)">
          <path
            d="M14 34 C 24 22, 66 22, 76 34 C 60 36, 30 36, 14 34 Z"
            fill="url(#teaGaiwanGrad)"
            stroke="var(--border)"
            strokeWidth="1.2"
          />
          {/* Lid Rim Accent */}
          <path
            d="M18 33 C 27 24, 63 24, 72 33"
            stroke="var(--accent)"
            strokeWidth="0.8"
            strokeOpacity="0.5"
            fill="none"
          />
          {/* Golden Finial Knob */}
          <ellipse cx="45" cy="22" rx="7.5" ry="4" fill="url(#teaGoldGrad)" />
          <circle cx="45" cy="21" r="2.5" fill="var(--surface)" opacity="0.6" />
        </g>

        {/* Rising Fragrant Tea Steam (Delicate Animated Paths) */}
        <g className="anim-steam-1">
          <path
            d="M38 16 C 35 8, 44 4, 39 -4"
            stroke="var(--text-muted)"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
        <g className="anim-steam-2">
          <path
            d="M51 18 C 54 10, 46 5, 52 -2"
            stroke="var(--accent)"
            strokeOpacity="0.55"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </g>

      {/* Fresh Botanical Tea Leaves on the Left (One Bud Two Leaves - 一芽二叶) */}
      <g transform="translate(36, 52)" className="anim-leaf">
        {/* Curved Vine / Stem */}
        <path
          d="M10 68 Q 28 42 40 22"
          stroke="var(--primary)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Delicate Young Bud */}
        <path
          d="M40 22 C 46 16, 50 10, 50 5 C 45 10, 42 16, 40 22 Z"
          fill="var(--primary-hover)"
          stroke="var(--primary)"
          strokeWidth="0.8"
        />
        {/* First Tender Leaf */}
        <path
          d="M34 32 C 48 27, 56 36, 51 46 C 43 44, 36 38, 34 32 Z"
          fill="url(#teaJadeGrad)"
          filter="url(#teaCeremonyJadeGlow)"
        />
        <path
          d="M35 33 Q 44 38 49 44"
          stroke="var(--surface)"
          strokeWidth="0.7"
          strokeOpacity="0.6"
          fill="none"
        />
        {/* Second Leaf */}
        <path
          d="M22 47 C 9 42, 5 54, 11 62 C 19 59, 21 50, 22 47 Z"
          fill="var(--primary)"
          opacity="0.85"
        />
      </g>

      {/* Cultural Origin Stamp Seal on the Right: Chinese Seal Script Style */}
      <g transform="translate(242, 50)">
        <rect
          width="48"
          height="48"
          rx="12"
          fill="var(--surface)"
          stroke="var(--accent)"
          strokeWidth="1.5"
          className="shadow-sm"
        />
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="9"
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.3"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <text
          x="24"
          y="23"
          fill="var(--accent-text)"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="serif"
        >
          茶
        </text>
        <text
          x="24"
          y="36"
          fill="var(--text-muted)"
          fontSize="6.5"
          fontWeight="700"
          letterSpacing="0.1em"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          ATLAS
        </text>
      </g>

      {/* Floating Sparkles & Golden Aroma Particles */}
      <circle cx="95" cy="42" r="1.5" fill="var(--accent)" opacity="0.85" />
      <circle cx="160" cy="32" r="2" fill="var(--accent)" opacity="0.95" />
      <circle cx="225" cy="38" r="1.5" fill="var(--primary)" opacity="0.75" />
      <circle cx="185" cy="22" r="1.2" fill="var(--text-muted)" opacity="0.6" />
    </svg>
  )
}
