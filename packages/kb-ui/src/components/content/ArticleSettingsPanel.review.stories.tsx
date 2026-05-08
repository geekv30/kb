import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import {
  ArticleSettingsPanel,
  type ArticleSettings,
} from './ArticleSettingsPanel';
import { FigmaCompare } from '../../_review/FigmaCompare';
import articleSettingsPanelFigma from '../../../../../design/screenshots/article-settings-panel.png';
import { figmaNode } from './ArticleSettingsPanel.figma';

const meta: Meta<typeof ArticleSettingsPanel> = {
  title: 'Review/Content/ArticleSettingsPanel',
  component: ArticleSettingsPanel,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

/**
 * Figma frame `53:8384` ("settings.config - expanded") is a 452×356
 * snippet showing the panel header (settings cog + "Settings" label +
 * up chevron), the divider rule, and three populated dropdowns:
 *   - Author (Avatar "A" + "Varun K" + chevron)
 *   - Category ("Hiver in Incognito" + chevron)
 *   - Article Slug ("article-default-slug" + "14/32" counter)
 *
 * The production `ArticleSettingsPanel` renders the full 8-field set
 * specified in PRD §13: author, category, slug, tags, publish date,
 * SEO title, visibility, reviewers. The 3-field Figma frame is a
 * design snippet, not a complete spec. We seed all 8 fields with
 * realistic values so the chrome (header, divider, field gap, outer
 * padding, footer) can be reviewed against Figma — the first three
 * fields will line up, the rest extend below the Figma raster.
 *
 * **Inline drift fixed in this dispatch**: production card border was
 * `#e2e8f0`; Figma ships `#f1f5f9` (`--color-border`). Aligned to
 * `#f1f5f9` to stay consistent with `ContentEditor`.
 *
 * **Deferred — flagged for follow-up**:
 *   - Figma's Author field uses an avatar with a green online-status
 *     dot at the bottom-right corner. Production `Avatar` does not
 *     render the dot in this context. Adding a status indicator would
 *     widen the avatar API; defer.
 *   - Figma's `Avatar` glyph is the lowercase letter "A" rendered in a
 *     `#525252` body color on a `#e5e5e5` chip. Production `Avatar`
 *     uses initials computed from the name plus the kb-ui slate color
 *     ramp. Visual delta is small but non-zero; needs a dedicated
 *     review pass on `Avatar` itself.
 */
const POPULATED_SETTINGS: ArticleSettings = {
  author: { name: 'Varun K', initials: 'VK' },
  category: 'Hiver in Incognito',
  // Trimmed to 14 chars so the counter pill reads `14/32` exactly as in
  // Figma `53:8384` (Article Slug field).
  slug: 'article-defaul',
  tags: ['Security', 'Account', 'Password'],
  publishDate: 'Apr 12, 2026',
  seoTitle: 'Reset Your Password — Hiver Help',
  visibility: 'Public',
  reviewers: [
    { name: 'Ananya Kapoor', initials: 'AK' },
    { name: 'Maya Rao', initials: 'MR' },
    { name: 'Tanvi Shah', initials: 'TS' },
  ],
};

function ArticleSettingsPanelReview() {
  return (
    <FigmaCompare
      storyKey="content-article-settings-panel"
      figmaImage={articleSettingsPanelFigma}
      componentLabel="ArticleSettingsPanel"
      frameLabel="Figma · settings.config (expanded, 3-field snippet)"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 452 }}>
        <ArticleSettingsPanel value={POPULATED_SETTINGS} />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof ArticleSettingsPanel> = {
  render: () => <ArticleSettingsPanelReview />,
};
