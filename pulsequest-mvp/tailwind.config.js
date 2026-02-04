/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'system', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
          light: '#A5B4FC',
        },
      },
    },
  },
  plugins: [],
}

