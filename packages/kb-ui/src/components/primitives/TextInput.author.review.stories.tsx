import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown } from '@untitledui/icons';
import '../../tokens.css';
import { Avatar } from './Avatar';
import { Field } from './Field';
import { TextInput } from './TextInput';
import { FigmaCompare } from '../../_review/FigmaCompare';
import authorFigma from '../../../../../design/screenshots/text-input-field-author.png';
import { figmaNode } from './TextInput.author.figma';

const meta: Meta = {
  title: 'Review/Primitives/TextInput/Author',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function AuthorReview() {
  return (
    <FigmaCompare
      storyKey="primitives-textinput-author"
      figmaImage={authorFigma}
      componentLabel="TextInput · Author"
      frameLabel="Figma · Input field / Author"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 460 }}>
        <Field label="Author" htmlFor="rv-author">
          <TextInput
            id="rv-author"
            value="Varun K"
            prefix={<Avatar initials="A" showStatus />}
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

export const Author: StoryObj = {
  render: () => <AuthorReview />,
};
