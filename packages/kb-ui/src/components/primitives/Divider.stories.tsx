import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Divider } from './Divider';
import { Card } from './Card';

const meta: Meta<typeof Divider> = {
  title: 'Components/Primitives/Divider',
  component: Divider,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

const SECTIONS: Array<{ label: string; value: string }> = [
  { label: 'Author', value: 'Varun Kelkar' },
  { label: 'Category', value: 'Managing emails' },
  { label: 'Visibility', value: 'Public' },
];

function DividerPlayground() {
  return (
    <Card padding="md" className="w-80 font-sans">
      {SECTIONS.map((section, index) => (
        <div key={section.label}>
          <div className="py-3">
            <div className="text-[12px] leading-[18px] text-[#64758b]">
              {section.label}
            </div>
            <div className="text-[14px] leading-[20px] text-[#0f172a]">
              {section.value}
            </div>
          </div>
          {index < SECTIONS.length - 1 && <Divider />}
        </div>
      ))}
    </Card>
  );
}

export const Playground: StoryObj<typeof Divider> = {
  render: () => <DividerPlayground />,
};
