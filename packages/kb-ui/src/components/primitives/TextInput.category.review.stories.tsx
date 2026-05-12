import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown } from '@untitledui/icons';
import '../../tokens.css';
import { Field } from './Field';
import { TextInput } from './TextInput';
import { FigmaCompare } from '../../_review/FigmaCompare';
import categoryFigma from '../../../../../design/screenshots/text-input-field-category.png';
import { figmaNode } from './TextInput.category.figma';

const meta: Meta = {
  title: 'Review/Primitives/TextInput/Category',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function CategoryReview() {
  return (
    <FigmaCompare
      storyKey="primitives-textinput-category"
      figmaImage={categoryFigma}
      componentLabel="TextInput · Category"
      frameLabel="Figma · Input field / Category"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 460 }}>
        <Field label="Category" htmlFor="rv-category">
          <TextInput
            id="rv-category"
            value="Hiver in Incognito"
            suffix={
              <ChevronDown
                size={14}
                className="text-[#64748b]"
                aria-hidden="true"
              />
            }
          />
        </Field>
      </div>
    </FigmaCompare>
  );
}

export const Category: StoryObj = {
  render: () => <CategoryReview />,
};
