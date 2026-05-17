import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import '../../tokens.css';
import { ArticleTitleInput } from './ArticleTitleInput';

const meta: Meta<typeof ArticleTitleInput> = {
  title: 'Components/Content/ArticleTitleInput',
  component: ArticleTitleInput,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function ArticleTitleInputEmpty() {
  const [value, setValue] = useState('');

  return (
    <div className="w-[720px] font-sans">
      <ArticleTitleInput value={value} onChange={setValue} autoFocusOnEmpty />
    </div>
  );
}

function ArticleTitleInputFilled() {
  const [value, setValue] = useState(
    'How to configure SSO with SAML 2.0 for enterprise accounts using Okta as the identity provider',
  );

  return (
    <div className="w-[720px] font-sans">
      <ArticleTitleInput value={value} onChange={setValue} autoFocusOnEmpty={false} />
    </div>
  );
}

export const Default: StoryObj<typeof ArticleTitleInput> = {
  render: () => <ArticleTitleInputEmpty />,
};

export const Filled: StoryObj<typeof ArticleTitleInput> = {
  render: () => <ArticleTitleInputFilled />,
};
