// @hiver/kb-ui — design tokens (programmatic access)
// Source of truth mirrored from src/tokens.css. Keep in sync.

export const tokens = {
  color: {
    canvas: '#f5f5f5',
    appBg: '#fcfcfc',
    surface: '#ffffff',
    surfaceSubtle: '#f8fafc',
    surfaceMuted: '#f1f5f9',
    surfaceTab: '#f1f2f4',
    brandBar: '#e6effd',
    navRail: '#e2e8f0',

    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textMeta: '#475569',
    textMuted: '#64748b',
    textDisabled: '#94a3b8',
    textFaint: '#64748b',

    successText: '#086e3f',
    btnPrimary: '#000000',
    btnDangerBg: '#feeeec',

    border: '#f1f5f9',
    borderInput: '#e5e5e5',
    highlight: '#e7f9ee',
  },
  radius: {
    card: '12px',
    btn: '6px',
    input: '8px',
    pill: '999px',
    breadcrumb: '4px',
  },
  shadow: {
    md: '0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -2px rgba(0, 0, 0, 0.10)',
    lg: '0px 8px 12px -4px rgba(0, 0, 0, 0.05), 0px 4px 6px -2px rgba(0, 0, 0, 0.10)',
  },
  font: {
    sans: 'Inter, system-ui, sans-serif',
  },
  layout: {
    canvasWidth: '1280px',
    railWidth: '54px',
    treeWidth: '288px',
    contentWidth: '938px',
    chromeHeight: '85px',
    editorCardWidth: '720px',
    settingsPanelWidth: '452px',
  },
} as const;

export type Tokens = typeof tokens;
