import { RiAddLine } from '@remixicon/react';
import { cn } from '../../utils/cn';
import { Button } from '../primitives/Button';

export type PageHeaderProps = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  onNewClick?: () => void;
  newButtonLabel?: string;
  className?: string;
};

export function PageHeader({
  icon,
  title,
  subtitle,
  onNewClick,
  newButtonLabel = 'New article',
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between py-1', className)}>
      <div className="flex items-center gap-4">
        {icon && (
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6.6px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] [&>svg]:h-[22px] [&>svg]:w-[22px]"
          >
            {icon}
          </span>
        )}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[18px] font-semibold leading-[28px] text-[#0f172a]">{title}</h1>
          {subtitle && (
            <p className="text-[14px] font-medium leading-[20px] text-[#475569]">{subtitle}</p>
          )}
        </div>
      </div>
      <Button variant="primary" icon={<RiAddLine size={14} />} onClick={onNewClick}>
        {newButtonLabel}
      </Button>
    </div>
  );
}
