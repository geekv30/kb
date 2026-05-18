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
 * Figma frame `2945:7756` is the new SEO-panel General-tab visual —
 * header, divider, General/SEO tab switcher, then 3 populated fields:
 *   - Author (Avatar "A" + "Varun K" + chevron)
 *   - Category ("Hiver in Incognito" + chevron)
 *   - Article Slug ("article-default-slug" + "14/32" counter, no chevron)
 *
 * Chunk 2 of the SEO panel scaffold trims the panel from 8 fields to
 * 3 + a SEO placeholder tab. This review story seeds the 3 General-tab
 * fields with realistic values so the chrome (header, divider, tabs,
 * field gap, outer padding) can be reviewed against Figma.
 */
const POPULATED_SETTINGS: ArticleSettings = {
  author: { name: 'Varun K', initials: 'VK' },
  category: 'Hiver in Incognito',
  // Trimmed to 14 chars so the counter pill reads `14/32` exactly as in
  // Figma `2945:7756` (Article Slug field).
  slug: 'article-defaul',
};

function ArticleSettingsPanelReview() {
  return (
    <FigmaCompare
      storyKey="content-article-settings-panel"
      figmaImage={articleSettingsPanelFigma}
      componentLabel="ArticleSettingsPanel"
      frameLabel="Figma · settings.config (General tab, SEO panel scaffold)"
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
