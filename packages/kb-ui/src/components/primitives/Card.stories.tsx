import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Card } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'Components/Primitives/Card',
  component: Card,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function CardPlayground() {
  return (
    <div className="font-sans">
      <Card padding="md" style={{ width: 420 }}>
        <h3 className="text-[16px] font-semibold leading-6 text-[#0f172a]">
          Reset your password
        </h3>
        <p className="text-[14px] leading-5 text-[#64758b] mt-2">
          Step-by-step guide to recover access if you've forgotten your credentials.
          Updated for 2026.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Button variant="primary" onClick={() => {}}>
            Read article
          </Button>
          <Button variant="ghost" onClick={() => {}}>
            Share
          </Button>
        </div>
      </Card>
    </div>
  );
}

export const Playground: StoryObj<typeof Card> = {
  render: () => <CardPlayground />,
};
