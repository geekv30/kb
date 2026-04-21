import { create } from 'storybook/theming';

/**
 * Hiver KB Storybook theme.
 *
 * Colors pulled from `src/tokens.css` / `design/_tokens.md`:
 * - `colorPrimary`  → `--color-text-neutral-default` (slate-900ish)
 * - `colorSecondary` → `--color-icon-accents-purple-default` (Hiver accent)
 * - borders, bg, text match the product shell
 */

// CompanyLogo.svg inlined as a data URL, scaled up and paired with a wordmark
// so the brand area reads as a proper logo unit in the Storybook chrome.
const brandSvg = `
<svg xmlns='http://www.w3.org/2000/svg' width='140' height='28' viewBox='0 0 140 28' fill='none'>
  <rect width='28' height='28' rx='5' fill='#2D2D2D'/>
  <path d='M15.0 13.1C17.2 13.1 19.0 14.9 19.0 17.1V21.9C16.8 21.9 15.0 20.1 15.0 17.9V13.1ZM9.0 6.1C11.2 6.1 13.0 7.9 13.0 10.1V21.5C10.8 21.5 9.0 19.7 9.0 17.5V6.1Z' fill='white'/>
  <text x='38' y='19' font-family='Inter, -apple-system, sans-serif' font-size='14' font-weight='600' fill='#0f172a' letter-spacing='-0.01em'>Hiver KB</text>
</svg>
`.trim();

const brandImage = `data:image/svg+xml;utf8,${encodeURIComponent(brandSvg)}`;

export default create({
  base: 'light',

  // Branding
  brandTitle: 'Hiver KB Components',
  brandUrl: 'https://app.hiverkb.com',
  brandImage,
  brandTarget: '_blank',

  // Palette
  colorPrimary: '#0f172a', // text/neutral/default
  colorSecondary: '#6634ef', // icon/accents/purple/default — Hiver accent

  // App chrome
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appBorderColor: '#e5e5e5',
  appBorderRadius: 8,

  // Typography
  fontBase: '"Inter", -apple-system, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, monospace',
  textColor: '#0f172a',
  textInverseColor: '#ffffff',

  // Top/tab toolbar
  barTextColor: '#64748b',
  barSelectedColor: '#0f172a',
  barBg: '#ffffff',

  // Form inputs
  inputBg: '#ffffff',
  inputBorder: '#cbd5e1',
  inputTextColor: '#0f172a',
  inputBorderRadius: 6,
});
