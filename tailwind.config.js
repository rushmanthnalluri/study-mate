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
          50: 'var(--accent-50)',
          100: 'var(--accent-100)',
          200: 'var(--accent-200)',
          300: 'var(--accent-300)',
          400: 'var(--accent-400)',
          500: 'var(--accent-500)',
          600: 'var(--accent-600)',
          700: 'var(--accent-700)',
          800: 'var(--accent-800)',
          900: 'var(--accent-900)',
          950: 'var(--accent-950)',
        },
        surface: {
          DEFAULT: 'var(--background)',
          card: 'var(--card)',
          subtle: 'var(--surface)',
          border: 'var(--border)',
          muted: 'var(--muted-foreground)',
          dark: 'var(--foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          secondary: 'var(--accent-secondary)',
          foreground: 'var(--accent-foreground)',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'editorial-sm': 'var(--shadow-sm)',
        'editorial-md': 'var(--shadow-md)',
        'editorial-lg': 'var(--shadow-lg)',
      },
      borderRadius: {
        editorial: '0.5rem',
      },
    },
  },
  plugins: [],
};
