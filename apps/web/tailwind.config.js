/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        sage: {
          50: '#f6f7f5',
          100: '#e9ece7',
          200: '#d4dad0',
          300: '#b5c0b0',
          400: '#92a38b',
          500: '#73866c',
          600: '#5a6b54',
          700: '#475442',
          800: '#3a4437',
          900: '#31392f',
        },
        warm: {
          50: '#FAF9F6',
          100: '#F5F5F0',
          200: '#EBEBE5',
          300: '#D6D5CE',
          800: '#292524',
          900: '#1C1917',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
