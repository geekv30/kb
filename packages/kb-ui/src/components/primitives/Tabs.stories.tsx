import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import '../../tokens.css';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Primitives/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function TabsPlayground() {
  const [value, setValue] = React.useState('seo');
  return (
    <div className="flex flex-col gap-4 font-sans" style={{ maxWidth: 360 }}>
      <h2 className="text-[16px] font-semibold leading-6 text-text-primary">Tabs</h2>

      <Tabs value={value} onValueChange={setValue}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <p className="text-[14px] leading-5 text-text-muted">
            General tab content.
          </p>
        </TabsContent>
        <TabsContent value="seo">
          <p className="text-[14px] leading-5 text-text-muted">
            SEO tab content.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Playground: StoryObj<typeof Tabs> = {
  render: () => <TabsPlayground />,
};
