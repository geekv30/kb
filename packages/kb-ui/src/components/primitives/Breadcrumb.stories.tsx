import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Primitives/Breadcrumb',
  component: Breadcrumb,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function BreadcrumbPlayground() {
  return (
    <div className="font-sans">
      <Breadcrumb
        items={[
          { id: 'home', label: 'Home', onClick: () => {} },
          { id: 'help', label: 'Help center', onClick: () => {} },
          { id: 'gs', label: 'Getting started', onClick: () => {} },
          { id: 'qs', label: 'Quick start' },
        ]}
      />
    </div>
  );
}

export const Playground: StoryObj<typeof Breadcrumb> = {
  render: () => <BreadcrumbPlayground />,
};
