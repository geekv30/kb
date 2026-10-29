import type { HelpCenter, User } from '../types';

export const HIVER_AI_USER_ID = 'user-hiver-ai';

export const helpCenters: HelpCenter[] = [
  {
    id: 'hc-product',
    title: 'product help center',
    slug: 'product',
    subdomain: 'product',
    isInternal: true,
  },
];

export const users: User[] = [
  {
    id: 'user-varun',
    name: 'Varun Kelkar',
    initial: 'V',
    avatarColor: 'var(--color-legacy-avatar-v)',
  },
  {
    id: 'user-ashuthosh',
    name: 'Ashuthosh Rao',
    initial: 'A',
    avatarColor: 'var(--color-legacy-avatar-a)',
  },
  {
    // Author of changes applied in auto mode. Activity reads "by Hiver AI".
    id: HIVER_AI_USER_ID,
    name: 'Hiver AI',
    initial: 'H',
    avatarColor: 'var(--color-legacy-blue)',
  },
];
