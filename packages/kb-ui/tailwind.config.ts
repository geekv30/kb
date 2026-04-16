import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        'app-bg': 'var(--color-app-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          subtle: 'var(--color-surface-subtle)',
          muted: 'var(--color-surface-muted)',
          tab: 'var(--color-surface-tab)',
        },
        'brand-bar': 'var(--color-brand-bar)',
        'nav-rail': 'var(--color-nav-rail)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-meta': 'var(--color-text-meta)',
        'text-muted': 'var(--color-text-muted)',
        'success-text': 'var(--color-success-text)',
        'btn-primary': 'var(--color-btn-primary)',
        'btn-danger': 'var(--color-btn-danger-bg)',
        'kb-border': 'var(--color-border)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
        card: '12px',
        btn: '6px',
      },
    },
  },
  plugins: [],
} satisfies Config;
