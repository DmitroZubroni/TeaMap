/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-translucent': 'var(--surface-translucent)',
        'surface-2': 'var(--surface-2)',
        text: 'var(--text)',
        muted: 'var(--text-muted)',
        border: 'var(--border)',
        field: 'var(--field-border)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          soft: 'var(--primary-soft)',
        },
        'on-primary': 'var(--on-primary)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          soft: 'var(--accent-soft)',
          text: 'var(--accent-text)',
        },
        'on-accent': 'var(--on-accent)',
        'accent-text': 'var(--accent-text)',
        danger: {
          DEFAULT: 'var(--danger)',
          soft: 'var(--danger-soft)',
          text: 'var(--danger-text)',
        },
        'on-danger': 'var(--on-danger)',
        'danger-text': 'var(--danger-text)',
        success: {
          DEFAULT: 'var(--success)',
          soft: 'var(--success-soft)',
          text: 'var(--success-text)',
        },
        'on-success': 'var(--on-success)',
        'success-text': 'var(--success-text)',
        warning: {
          DEFAULT: 'var(--warning)',
          soft: 'var(--warning-soft)',
          text: 'var(--warning-text)',
        },
        'on-warning': 'var(--on-warning)',
        'warning-text': 'var(--warning-text)',
        // Semantic liquor colors for tea infusions
        liquor: {
          white: '#EFDFA0',
          green: '#7FA579',
          yellow: '#E0BB5C',
          oolong_light: '#D3AA51',
          oolong_dark: '#A9682E',
          red: '#B0492A',
          dark_sheng: '#8C6A3F',
          dark_shu: '#452B1C',
          dark_other: '#6B4A30',
        },
        // Legacy fallbacks aliased to semantic tokens so old references gracefully map
        ink: {
          DEFAULT: 'var(--text)',
          soft: 'var(--text-muted)',
        },
        porcelain: {
          DEFAULT: 'var(--surface)',
          dim: 'var(--surface-2)',
        },
        jade: 'var(--primary)',
        gold: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-hover)',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
        pin: 'var(--shadow-pin)',
        subtle: '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
