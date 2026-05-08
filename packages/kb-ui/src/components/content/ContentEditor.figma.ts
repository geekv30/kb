export const figmaNode = {
  fileKey: '9aGp5t9fH1d0PXi4LMhOdb',
  // Canonical 720×1460 editor card (`Sidebar Container` 53:2316) inside the
  // `editor` page (53:2301). Frame `53:2315` is the page-level wrapper; we
  // use it because the card itself fills the wrapper at the same width.
  // The Figma frame includes header (title + last-updated) on top of the
  // editor body — those are NOT part of `ContentEditor` (the production
  // component renders only the rich-text body). See review report for the
  // structural-drift flag.
  nodeId: '53:2315',
  screenshotName: 'content-editor',
} as const;
