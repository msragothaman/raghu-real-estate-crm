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
          50: '#F5F2FF',
          100: '#F3EFFF',
          200: '#DDD1FF',
          300: '#BEA8FF',
          400: '#9B77FF',
          500: '#6C3BFF', // Primary Purple
          600: '#5A2FE0',
          700: '#4B1FB8', // Dark Purple
          800: '#3A1694',
          900: '#2C0F73',
          DEFAULT: '#6C3BFF',
          dark: '#4B1FB8',
          light: '#F3EFFF',
          bg: '#F8F8FC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
