import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from '@untitledui/icons';
import '../../tokens.css';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Primitives/Button',
  component: Button,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function ButtonPlayground() {
  return (
    <div className="flex flex-col gap-4 font-sans">
      <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
        Button
      </h2>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => {}}>
          Save
        </Button>
        <Button variant="subtle" onClick={() => {}}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => {}}>
          Outline
        </Button>
        <Button variant="ghost" onClick={() => {}}>
          Learn more
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="danger" onClick={() => {}}>
          Delete
        </Button>
        <Button variant="danger-outline" onClick={() => {}}>
          Cancel
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" disabled>
          Disabled
        </Button>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => {}}>
          New article
        </Button>
      </div>
    </div>
  );
}

export const Playground: StoryObj<typeof Button> = {
  render: () => <ButtonPlayground />,
};
