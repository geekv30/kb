import * as Tooltip from '@radix-ui/react-tooltip';
import { InfoCircle } from '@untitledui/icons';
import { cn } from '../../utils/cn';

export type FieldProps = {
  /** Label rendered above the input. */
  label?: React.ReactNode;
  /** When true, renders a `*` after the label. */
  required?: boolean;
  /** When truthy, renders an info icon next to the label. ReactNodes render
   *  inside the tooltip body verbatim; strings render as plain text. */
  tooltip?: React.ReactNode;
  /** Bottom-left helper text. */
  hint?: React.ReactNode;
  /** Bottom-right slot — char counter, status badge, etc. */
  hintEnd?: React.ReactNode;
  /** Wires `<label htmlFor>` to the input id for a11y. */
  htmlFor?: string;
  className?: string;
  /** The input itself (TextInput, Dropdown, etc). */
  children: React.ReactNode;
};

export function Field({
  label,
  required,
  tooltip,
  hint,
  hintEnd,
  htmlFor,
  className,
  children,
}: FieldProps) {
  const showLabelRow = label !== undefined || tooltip !== undefined;
  const showHintRow = hint !== undefined || hintEnd !== undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {showLabelRow && (
        <div className="flex items-center gap-1">
          {label !== undefined && (
            <label
              htmlFor={htmlFor}
              className="text-[14px] font-medium leading-5 text-text-primary"
            >
              {label}
              {required && (
                <span aria-hidden="true" className="ml-0.5 text-text-muted">
                  *
                </span>
              )}
            </label>
          )}
          {tooltip !== undefined && (
            <Tooltip.Provider delayDuration={150}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    aria-label="More information"
                    className="inline-flex items-center text-text-disabled outline-none focus-visible:text-text-meta"
                  >
                    <InfoCircle size={14} aria-hidden="true" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="top"
                    sideOffset={6}
                    className="z-50 max-w-xs rounded-md bg-text-primary px-2 py-1 text-[12px] leading-[18px] text-white shadow-md"
                  >
                    {tooltip}
                    <Tooltip.Arrow className="fill-text-primary" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>
      )}
      {children}
      {showHintRow && (
        <div className="flex items-center justify-start gap-2 text-[12px] font-normal leading-[18px] text-text-muted">
          {hint !== undefined && <span>{hint}</span>}
          {hintEnd !== undefined && <span>{hintEnd}</span>}
        </div>
      )}
    </div>
  );
}
