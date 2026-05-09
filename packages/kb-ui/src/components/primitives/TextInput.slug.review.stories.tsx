import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Field } from './Field';
import { TextInput } from './TextInput';
import { FigmaCompare } from '../../_review/FigmaCompare';
import slugFigma from '../../../../../design/screenshots/text-input-field-slug.png';
import { figmaNode } from './TextInput.slug.figma';

const meta: Meta = {
  title: 'Review/Primitives/TextInput/Article Slug',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function ArticleSlugReview() {
  return (
    <FigmaCompare
      storyKey="primitives-textinput-slug"
      figmaImage={slugFigma}
      componentLabel="TextInput · Article Slug"
      frameLabel="Figma · Input field / Article Slug"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 460 }}>
        <Field label="Article Slug" htmlFor="rv-slug">
          <TextInput
            id="rv-slug"
            value="article-default-slug"
            charCount={{ current: 14, max: 32 }}
          />
        </Field>
      </div>
    </FigmaCompare>
  );
}

export const ArticleSlug: StoryObj = {
  render: () => <ArticleSlugReview />,
};
