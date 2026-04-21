import { RiArrowDownSLine } from '@remixicon/react';
import { TextInput, type TextInputProps } from './TextInput';
import { cn } from '../../utils/cn';

export type DropdownProps = Omit<TextInputProps, 'suffix'> & {
  label: string;
  className?: string;
};

export function Dropdown({ label, className, ...inputProps }: DropdownProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-[14px] font-medium leading-5 text-[#0f172a]">{label}</label>
      <TextInput
        {...inputProps}
        suffix={<RiArrowDownSLine size={14} className="text-[#475569]" />}
      />
    </div>
  );
}
