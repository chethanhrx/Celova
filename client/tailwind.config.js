/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        bg2: '#111111',
        bg3: '#181818',
        surface: '#1f1f1f',
        surface2: '#272727',
        orange: {
          DEFAULT: '#f97316',
          400: '#fb923c',
          300: '#fdba74',
        },
        gold: '#fbbf24',
        cyan: '#22d3ee',
        green: '#22c55e',
        red: '#ef4444',
        text: {
          DEFAULT: '#f5f5f5',
          2: '#a3a3a3',
          3: '#525252',
        },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(135deg, #f97316, #fb923c)',
        'gradient-dark': 'linear-gradient(180deg, transparent, #0a0a0a)',
        'gradient-card': 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.95) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.4s ease',
        'scale-in': 'scaleIn 0.3s ease',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'equalizer': 'equalizer 1.2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.9)' }, to: { opacity: '1', transform: 'scale(1)' } },
        equalizer: {
          '0%, 100%': { height: '4px' }, '25%': { height: '20px' },
          '50%': { height: '12px' }, '75%': { height: '18px' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'orange': '0 0 20px rgba(249,115,22,0.4)',
        'orange-lg': '0 0 40px rgba(249,115,22,0.3)',
        'card': '0 8px 32px rgba(0,0,0,0.5)',
        'glow': '0 0 30px rgba(249,115,22,0.2)',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
      },
    },
  },
  plugins: [],
};
