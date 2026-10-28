// Icons of the Hiver Admin Panel (v2.hiverhq.com), copied verbatim from
// its shipped bundles and hash-checked against the live page. Untitled
// UI ones (nav) are regenerated from @untitledui/icons at the live 1.7
// stroke. `currentColor` icons take the wrapper's text color; the rest
// keep the fills they ship with.

import { cn } from '../lib/cn';

const SOURCES = import.meta.glob<string>('../assets/hiver-admin/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(SOURCES).map(([file, svg]) => [file.slice(file.lastIndexOf('/') + 1, -'.svg'.length), svg]),
);

export type AdminIconName =
  | 'add'
  | 'adminLogo'
  | 'arrowDropDown'
  | 'bannerAlert'
  | 'chevron'
  | 'deleteOutline'
  | 'errorOutline'
  | 'hcArrow'
  | 'hcDelete'
  | 'hcEdit'
  | 'hcFile'
  | 'hcGlobe'
  | 'hcLock'
  | 'hcOpen'
  | 'hcTitle'
  | 'hcWarn'
  | 'navApps'
  | 'navClose'
  | 'navCustomObjects'
  | 'navDeveloperApis'
  | 'navGlobalConfig'
  | 'navHelpCenter'
  | 'navHelpCenterActive'
  | 'navHiverAi'
  | 'navHome'
  | 'navKnowledgeHub'
  | 'navKnowledgeHubActive'
  | 'navSettings'
  | 'navSharedInboxes'
  | 'navSharedLabels'
  | 'navUsers'
  | 'navWebForms'
  | 'srcConfluence'
  | 'srcDocument'
  | 'srcGoogleDrive'
  | 'srcHelpCenter'
  | 'srcNotion'
  | 'srcS3'
  | 'srcSnippets'
  | 'srcWebsite';

export interface AdminIconProps {
  name: AdminIconName;
  /** Rendered box in px; a number for square icons, [w, h] otherwise. */
  size: number | [number, number];
  className?: string;
}

export function AdminIcon({ name, size, className }: AdminIconProps) {
  const [width, height] = typeof size === 'number' ? [size, size] : size;
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 [&>svg]:block [&>svg]:size-full', className)}
      style={{ width, height }}
      dangerouslySetInnerHTML={{ __html: ICONS[name] ?? '' }}
    />
  );
}
