/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          25: '#FAF8FF',
          50: '#F5F0FF',
          100: '#EFE7FF',
          200: '#DFD0FF',
          300: '#C7ACFF',
          400: '#A67CFF',
          500: '#6C3BFF', // Pure Brand Purple
          600: '#5820E0',
          700: '#4714BA',
          800: '#380E94',
          900: '#2A086E',
          950: '#1B0449',
          DEFAULT: '#6C3BFF',
          dark: '#4714BA',
          light: '#F5F0FF',
          bg: '#F7F3FF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'purple-sm': '0 2px 8px -1px rgba(108, 59, 255, 0.12)',
        'purple-md': '0 4px 16px -2px rgba(108, 59, 255, 0.18)',
        'purple-lg': '0 8px 24px -4px rgba(108, 59, 255, 0.22)',
      }
    },
  },
  plugins: [],
}
