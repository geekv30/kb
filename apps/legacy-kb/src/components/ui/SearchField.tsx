import { useState, type InputHTMLAttributes } from 'react';
import { searchIcon } from '../../assets/legacy';
import { CloseGlyph } from './Modal';

export interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'className'> {
  value: string;
  onValueChange: (value: string) => void;
  /** Keep the clear button visible while blurred (e.g. results are open). */
  keepClearVisible?: boolean;
}

/*
 * Live search field (chunk 854 `V`/`G`): underline-only, 1px #d6e0eb
 * bottom border (#1473e6 on focus), 14/28 input with the search glyph
 * as a 16px background at 0 16px, padding 10 10 10 26. The clear (x)
 * shows while focused with a value.
 */
export function SearchField({
  value,
  onValueChange,
  keepClearVisible = false,
  onFocus,
  onBlur,
  ...inputProps
}: SearchFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="box-border flex w-full px-[15px]">
      <div className="box-border flex w-full items-center border-0 border-b border-solid border-legacy-divider focus-within:border-legacy-blue">
        <input
          type="text"
          {...inputProps}
          value={value}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-full border-0 bg-no-repeat pt-[10px] pr-[10px] pb-[10px] pl-[26px] text-[14px] leading-[28px] font-normal outline-none placeholder:text-legacy-meta"
          style={{
            backgroundImage: `url(${searchIcon})`,
            backgroundPosition: '0 16px',
            backgroundSize: '16px 16px',
          }}
        />
        {(focused || keepClearVisible) && value.length > 0 ? (
          <button
            type="button"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onValueChange('')}
            className="m-0 flex cursor-pointer border-0 bg-transparent p-0"
          >
            <CloseGlyph size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
