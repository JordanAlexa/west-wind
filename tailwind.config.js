/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        bg: 'hsl(var(--color-bg) / <alpha-value>)',
        text: 'hsl(var(--color-text) / <alpha-value>)',
        border: 'hsl(var(--color-border) / <alpha-value>)',
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        'surface-hover': 'hsl(var(--color-surface-hover) / <alpha-value>)',
        muted: 'hsl(var(--color-muted) / <alpha-value>)',
        accent: 'hsl(var(--color-accent) / <alpha-value>)',
        'accent-fg': 'hsl(var(--color-accent-fg) / <alpha-value>)',
        'input-bg': 'hsl(var(--color-input-bg) / <alpha-value>)',
        'card-bg': 'hsl(var(--color-card-bg) / <alpha-value>)',
        'modal-border': 'hsl(var(--color-modal-border) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}
