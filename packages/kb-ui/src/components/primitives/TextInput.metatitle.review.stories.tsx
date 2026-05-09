import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Field } from './Field';
import { TextInput } from './TextInput';
import { FigmaCompare } from '../../_review/FigmaCompare';
import metaTitleFigma from '../../../../../design/screenshots/text-input-field-meta-title.png';
import { figmaNode } from './TextInput.metatitle.figma';

const meta: Meta = {
  title: 'Review/Primitives/TextInput/Meta Title',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function MetaTitleReview() {
  return (
    <FigmaCompare
      storyKey="primitives-textinput-meta-title"
      figmaImage={metaTitleFigma}
      componentLabel="TextInput · Meta title"
      frameLabel="Figma · Input field / Meta title"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 460 }}>
        <Field
          label="Meta title"
          tooltip="Used by search engines and browser tabs."
          htmlFor="rv-meta-title"
          hint={
            <>
              <span>44 / 70</span>
              <span className="mx-1">·</span>
              <span className="text-[#086e3f]">Optimal</span>
            </>
          }
        >
          {/* Cell-4 border is `#e2e8f0` (slate-200), not the default `#e5e5e5` —
              twMerge promotes the override via `className`. Placeholder uses
              slate-600 instead of the default slate-400. */}
          <TextInput
            id="rv-meta-title"
            placeholder="Search, filter, and create email views"
            className="border-[#e2e8f0]"
            inputClassName="placeholder:text-[#475569]"
          />
        </Field>
      </div>
    </FigmaCompare>
  );
}

export const MetaTitle: StoryObj = {
  render: () => <MetaTitleReview />,
};
