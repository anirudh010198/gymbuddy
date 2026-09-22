/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rubber: 'var(--rubber)',
        chalk: 'var(--chalk)',
        iron: 'var(--iron)',
        line: 'var(--line)',
        go: 'var(--go)',
        warn: 'var(--warn)',
        soft: 'var(--soft)',
        bg: 'var(--bg)',
        card: 'var(--card)',
        ink: 'var(--text)',
        muted: 'var(--muted)',
        plate: {
          DEFAULT: 'var(--plate)',
          ink: 'var(--plate-ink)',
        },
      },
      fontFamily: {
        sans: ['Barlow', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'Barlow', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
        sheet: '22px',
      },
    },
  },
  plugins: [],
}
