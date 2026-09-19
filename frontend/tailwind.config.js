/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#060913',
          900: '#0c1322',
          850: '#111a30',
          800: '#172340',
        },
        cyan: {
          350: '#5eead4',
          400: '#22d3ee',
          500: '#06b6d4',
          950: '#083344',
        }
      },
      fontFamily: {
        sans: ['"Sora"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        heading: ['"Sora"', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s infinite ease-in-out',
        'glow-pulse': 'glow-pulse 2s infinite ease-in-out',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'draw-line': 'drawLine 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.99)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.3)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drawLine: {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '50%': { transform: 'scaleX(1)', transformOrigin: 'left' },
          '50.1%': { transform: 'scaleX(1)', transformOrigin: 'right' },
          '100%': { transform: 'scaleX(0)', transformOrigin: 'right' },
        }
      }
    },
  },
  plugins: [],
}
