/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
