import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Primitives/Avatar',
  component: Avatar,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

const PEOPLE: Array<{
  name: string;
  initials: string;
  src?: string;
}> = [
  {
    name: 'Varun Kelkar',
    initials: 'VK',
    src: 'https://i.pravatar.cc/64?img=12',
  },
  { name: 'Ananya Kapoor', initials: 'AK' },
  { name: 'Maya Rao', initials: 'MR' },
  { name: 'Tanvi Shah', initials: 'TS' },
];

function AvatarPlayground() {
  return (
    <div className="flex gap-6 font-sans">
      {PEOPLE.map((person) => (
        <div
          key={person.name}
          className="flex flex-col items-center gap-2"
        >
          <Avatar
            name={person.name}
            initials={person.initials}
            src={person.src}
          />
          <span className="text-[12px] leading-[18px] text-[#64748b]">
            {person.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export const Playground: StoryObj<typeof Avatar> = {
  render: () => <AvatarPlayground />,
};
