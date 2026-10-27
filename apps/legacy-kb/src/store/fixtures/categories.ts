import type { Category } from '../types';

// Flat categories, in sidebar order. Icons are Material Icons Outlined
// ligatures rendered in the help center's brand color.
export const categories: Category[] = [
  {
    id: 'cat-getting-started',
    helpCenterId: 'hc-product',
    slug: 'getting-started',
    title: 'Getting started',
    description: 'A small description line for this category',
    icon: '5g',
  },
  {
    id: 'cat-automation',
    helpCenterId: 'hc-product',
    slug: 'automation',
    title: 'Automation',
    description: 'Rules, schedules, and auto-replies that run without an agent',
    icon: 'smart_toy',
  },
  {
    id: 'cat-live-chat',
    helpCenterId: 'hc-product',
    slug: 'live-chat',
    title: 'Live chat',
    description: 'Set up and style the chat widget on your website',
    icon: 'chat',
  },
  {
    id: 'cat-first-steps',
    helpCenterId: 'hc-product',
    slug: 'first-steps',
    title: 'First steps',
    description: 'Everything a new teammate needs in their first week',
    icon: 'flag',
  },
];
