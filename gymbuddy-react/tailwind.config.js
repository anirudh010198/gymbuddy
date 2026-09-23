/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Every colour is wired to its `-rgb` (decimal "R G B" triplet) CSS
      // variable via rgb(var(...) / <alpha-value>), never to a plain
      // var(--hex) — that's what makes opacity modifiers (bg-plate/10,
      // border-line/50, ...) actually generate a rule. See src/index.css.
      colors: {
        void: 'rgb(var(--void-rgb) / <alpha-value>)',
        carbon: 'rgb(var(--carbon-rgb) / <alpha-value>)',
        steel: 'rgb(var(--steel-rgb) / <alpha-value>)',
        bone: 'rgb(var(--bone-rgb) / <alpha-value>)',
        ash: 'rgb(var(--ash-rgb) / <alpha-value>)',
        amber: 'rgb(var(--amber-rgb) / <alpha-value>)',
        rubber: 'rgb(var(--rubber-rgb) / <alpha-value>)',
        chalk: 'rgb(var(--chalk-rgb) / <alpha-value>)',
        line: 'rgb(var(--line-rgb) / <alpha-value>)',
        go: 'rgb(var(--go-rgb) / <alpha-value>)',
        warn: 'rgb(var(--warn-rgb) / <alpha-value>)',
        soft: 'rgb(var(--soft-rgb) / <alpha-value>)',
        bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
        card: 'rgb(var(--card-rgb) / <alpha-value>)',
        ink: 'rgb(var(--text-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        plate: {
          DEFAULT: 'rgb(var(--plate-rgb) / <alpha-value>)',
          ink: 'rgb(var(--plate-ink-rgb) / <alpha-value>)',
          border: 'rgb(var(--plate-border-rgb) / <alpha-value>)',
        },
      },
      boxShadow: {
        neon: '0 0 18px 3px var(--red-glow)',
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
