/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1C2A22',
          soft: '#2E4034',
        },
        porcelain: {
          DEFAULT: '#F3EEE0',
          dim: '#E7E0CC',
        },
        jade: '#4F6F52',
        indigo: '#223649',
        gold: {
          DEFAULT: '#C08A34',
          soft: '#DDB36B',
        },
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
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 20px 60px -20px rgba(28, 42, 34, 0.45)',
        pin: '0 2px 8px rgba(28, 42, 34, 0.35)',
      },
    },
  },
  plugins: [],
}
