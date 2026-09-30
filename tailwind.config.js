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
          50: '#fdf7f8',
          100: '#fbebed',
          200: '#f7d8dc',
          300: '#efb4bc',
          400: '#e28493',
          500: '#cf5469',
          600: '#b4374f',
          700: '#97283e',
          800: '#831d32', // Food Science Daily primary
          900: '#691829',
          950: '#3d0a14',
        },
        surface: {
          DEFAULT: '#fbfaf8',
          card: '#ffffff',
          subtle: '#f5f3f0',
          border: '#e7e3dc',
          muted: '#716d66',
          dark: '#1c1917',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'mobile-card': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
