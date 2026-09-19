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
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['"Outfit"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s infinite ease-in-out',
        'glow-pulse': 'glow-pulse 2s infinite ease-in-out',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.99)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.3)' },
        }
      }
    },
  },
  plugins: [],
}
