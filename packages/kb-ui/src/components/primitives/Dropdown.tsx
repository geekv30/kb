import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { RiArrowDownSLine } from '@remixicon/react';
import { TextInput, type TextInputProps } from './TextInput';
import { cn } from '../../utils/cn';

export type DropdownProps = Omit<TextInputProps, 'suffix'> & {
  label: string;
  className?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  onSelect?: (value: string) => void;
};

export function Dropdown({
  label,
  className,
  options,
  onSelect,
  ...inputProps
}: DropdownProps) {
  const trigger = (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-[14px] font-medium leading-5 text-text-primary">{label}</label>
      <TextInput
        {...inputProps}
        suffix={<RiArrowDownSLine size={14} className="text-text-meta" />}
      />
    </div>
  );

  if (options === undefined) {
    return trigger;
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="block w-full text-left">
          {trigger}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className="min-w-[160px] rounded-[8px] border border-[#e5e5e5] bg-white py-1 shadow-md"
        >
          {options.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              disabled={option.disabled}
              onSelect={(event) => {
                if (option.disabled) {
                  event.preventDefault();
                  return;
                }
                onSelect?.(option.value);
              }}
              className={cn(
                'mx-1 cursor-pointer rounded-[4px] px-3 py-2 text-[14px] outline-none hover:bg-surface-muted focus:bg-surface-muted',
                option.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent focus:bg-transparent',
              )}
            >
              {option.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
