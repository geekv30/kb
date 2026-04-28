import type { Preview } from '@storybook/react-vite';
import '../src/tokens.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: {
      options: {
        canvas: { name: 'canvas', value: '#f5f5f5' },
        white: { name: 'white', value: '#ffffff' }
      }
    },
    options: {
      storySort: {
        order: [
          'Getting Started',
          ['Welcome'],
          'Foundations',
          ['Overview', 'Typography', 'Colors', 'Icons', 'Spacing & Radius'],
          'Components',
          [
            'Primitives',
            'Layout',
            'Navigation',
            'Shell',
            'Article',
            'Tables',
            'Charts & Stats',
            'AI',
            'Overlays',
          ],
          'Patterns',
          ['Knowledge Base', 'AI Optimisation', 'Analytics'],
        ],
      },
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'canvas'
    }
  }
};

export default preview;
