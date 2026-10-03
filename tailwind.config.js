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
          50: '#FBF7EA',
          100: '#F6EFD2',
          200: '#EEDFA9',
          300: '#E4CB76',
          400: '#D4A84B',
          500: '#C49A24',
          600: '#B8860B',
          700: '#9A7208',
          800: '#805E06',
          900: '#654905',
          950: '#3B2B03',
        },
        surface: {
          DEFAULT: '#FAFAF8',
          card: '#FFFFFF',
          subtle: '#F5F3F0',
          border: '#E8E4DF',
          muted: '#6B6B6B',
          dark: '#1A1A1A',
        },
        accent: {
          DEFAULT: '#B8860B',
          secondary: '#D4A84B',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'editorial-sm': '0 1px 2px rgba(26,26,26,0.04)',
        'editorial-md': '0 4px 12px rgba(26,26,26,0.06)',
        'editorial-lg': '0 8px 24px rgba(26,26,26,0.08)',
      },
      borderRadius: {
        editorial: '0.5rem',
      },
    },
  },
  plugins: [],
};