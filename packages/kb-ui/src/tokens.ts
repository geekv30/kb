// @test-kb-ui/kb-ui — design tokens (programmatic access)
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
    textMuted: '#64758b',   // Figma text/neutral/faint
    textDisabled: '#94a3b8',
    textFaint: '#64758b',   // Figma text/neutral/faint

    successText: '#086e3f',
    btnPrimary: '#000000',
    btnDangerBg: '#feeeec',

    border: '#f1f5f9',
    borderInput: '#e5e5e5',
    highlight: '#e7f9ee',

    // AI Gaps semantic (Figma file 9aGp5t9fH1d0PXi4LMhOdb Frame 3 active addition 81:16926)
    aiAddition: '#086e3f',  // Figma text/success/default + icon/success/subtle
    aiReplace: '#065b89',   // Figma text/info/default + icon/info/strong
    aiRemoval: '#d52c1f',   // Figma text/danger/default + icon/danger/default
    aiPink: '#d92fff',
    aiAdditionWash: 'rgba(8, 110, 63, 0.10)',   // derived from #086e3f
    aiRemovalWash: 'rgba(213, 44, 31, 0.10)',   // derived from #d52c1f

    // Card semantics
    cardBorder: '#e5e5e5',
    cardDivider: '#e5e5e5',

    // Analytics — trend indicators (Figma SupportPerformanceCard 1974:53911)
    trendUp: '#086e3f',     // Figma text/success/default + icon/success/subtle
    trendDown: '#d52c1f',   // Figma text/danger/default + icon/danger/default
    trendNeutral: '#64748b',

    // Analytics — chart series + washes (Figma Article-views-over-time 1974:53969)
    chartViews: '#f56565',   // Figma Red/r400
    chartUnique: '#4299e1',  // Figma Blue/b400
    chartPositive: '#22c55e',
    chartBody: '#4b5468',    // Figma NeutralLight/nl700 (Body) — analytics body text + axis ticks
    chartWashUp: 'rgba(8, 110, 63, 0.10)',
    chartWashDown: 'rgba(213, 44, 31, 0.10)',
    chartWashInfo: 'rgba(66, 153, 225, 0.10)',

    // Analytics — chart annotations (Figma AI-deflection-rate 1974:53443)
    chartGoalLine: '#276cf0',     // Figma border/blue/default
    chartGoalLabelBg: '#26292e',  // Figma NeutralLight/nl800

    // Analytics — donut/pie palette (Figma Views-by-Category 1974:53988, 6 segments)
    donut1: '#4fd1c5',
    donut2: '#b4bfcc',
    donut3: '#6e7b91',
    donut4: '#98a2b2',
    donut5: '#dde3ee',
    donut6: '#4b5468',
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
