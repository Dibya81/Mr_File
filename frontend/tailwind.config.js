/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        deep: {
          DEFAULT: '#090D16',
          2: '#0B0F19',
        },
        surface: {
          light: '#FAFAFB',
          dark: '#090D16',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 12px 2px rgba(59, 130, 246, 0.25)',
        'glow-md': '0 0 24px 4px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 48px 8px rgba(59, 130, 246, 0.35)',
        'glow-xl': '0 0 80px 16px rgba(59, 130, 246, 0.2)',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'shine-sweep': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        'float-slow': 'float-slow 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shine-sweep': 'shine-sweep 3s linear infinite',
        'gradient-pan': 'gradient-pan 6s ease infinite',
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)',
        'line-grid': 'linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '32px 32px',
        'line-grid': '60px 60px',
      },
    },
  },
  plugins: [],
}
