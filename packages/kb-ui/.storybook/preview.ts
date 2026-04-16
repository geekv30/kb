import type { Preview } from '@storybook/react';
import '../src/tokens.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'canvas',
      values: [
        { name: 'canvas', value: '#f5f5f5' },
        { name: 'white', value: '#ffffff' },
      ],
    },
  },
};

export default preview;
