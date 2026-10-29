import { avatarPlaceholder } from '../../assets/legacy';
import { cn } from '../../lib/cn';
import type { User } from '../../store/types';

export interface AvatarProps {
  /** `undefined` renders the live "Unassigned" placeholder (Avatar.svg). */
  user: User | undefined;
  /** 40 is the Settings header avatar. */
  size: 24 | 32 | 40;
  className?: string;
}

/**
 * Round avatar. The live app shows the user's profile photo; the replica
 * renders an initial circle instead of hotlinking photos.
 */
export function Avatar({ user, size, className }: AvatarProps) {
  if (!user) {
    return (
      <img
        src={avatarPlaceholder}
        alt="Unassigned"
        width={size}
        height={size}
        draggable={false}
        className={cn('block shrink-0 rounded-full select-none', className)}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={user.name}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-inter leading-none font-medium text-white select-none',
        size === 40 ? 'text-[16px]' : size === 32 ? 'text-[14px]' : 'text-[12px]',
        className,
      )}
      style={{ width: size, height: size, backgroundColor: user.avatarColor }}
    >
      {user.initial}
    </span>
  );
}
