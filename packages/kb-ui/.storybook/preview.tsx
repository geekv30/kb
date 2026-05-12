import type { Preview } from '@storybook/react-vite';
import { Agentation } from 'agentation';
import '../src/tokens.css';

// Mount Agentation only on Review/* stories in the local dev variant.
// The isPublicBuild gate is defense-in-depth: Chromatic sets STORYBOOK_PUBLIC=1
// and filters out *.review.stories.tsx, but we still want to ensure the overlay
// never ships in the public build even if a Review story leaks in.
// Vite builder exposes STORYBOOK_-prefixed env vars via import.meta.env.
const isPublicBuild = import.meta.env.STORYBOOK_PUBLIC === '1';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: {
      expanded: true
    },
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
          'Review',
        ],
      },
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'canvas'
    }
  },

  decorators: [
    (Story, context) => {
      const showAgentation =
        !isPublicBuild && context.title.startsWith('Review/');
      return (
        <>
          <Story />
          {showAgentation ? <Agentation /> : null}
        </>
      );
    },
  ],
};

export default preview;
