// Phase 7.5.2 — User fixtures.
//
// 6 users matching PRD §13.6 exactly. Avatar colors are hex tints
// chosen to read well on the kb-ui Avatar primitive's grey neutral
// (the Avatar component renders a fixed bg in v1; the avatarColor
// field is reserved for a future variant pass and is set here for
// completeness of the entity contract).

import type { User } from '../types';

export const users: User[] = [
  {
    id: 'user-aanya',
    name: 'Aanya Krishnan',
    initials: 'AK',
    avatarColor: '#6366f1', // indigo-500
  },
  {
    id: 'user-mira',
    name: 'Mira Rao',
    initials: 'MR',
    avatarColor: '#ec4899', // pink-500
  },
  {
    id: 'user-tarun',
    name: 'Tarun Shah',
    initials: 'TS',
    avatarColor: '#0ea5e9', // sky-500
  },
  {
    id: 'user-devika',
    name: 'Devika Iyer',
    initials: 'DI',
    avatarColor: '#10b981', // emerald-500
  },
  {
    id: 'user-rohan',
    name: 'Rohan Mehta',
    initials: 'RM',
    avatarColor: '#f59e0b', // amber-500
  },
  {
    id: 'user-sana',
    name: 'Sana Pillai',
    initials: 'SP',
    avatarColor: '#8b5cf6', // violet-500
  },
];
