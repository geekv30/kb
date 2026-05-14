import * as React from 'react';
import { ChevronDown, Mail01, XClose } from '@untitledui/icons';
import { cn } from '../../utils/cn';
import { Modal } from './Modal';
import { Button } from '../primitives/Button';
import { Field } from '../primitives/Field';
import { TextInput } from '../primitives/TextInput';
import { Textarea } from '../primitives/Textarea';

/* ─────────────────────────────────────────────────────────────
 * NewCategoryModal — matches Figma node 1958:34896 from file
 * 251DTRmxl2L6jmXd3FWzHe.
 *
 * Built on the kb-ui `Modal` primitive with three chunkier-chrome
 * overrides (radius=12, bodyPadding=20, footerLayout="section").
 *
 * Two Figma quirks ship verbatim per spec:
 *   1. Parent Category dropdown counter sits AFTER the chevron
 *      (chevron-first, "14/32" second). This is intentionally
 *      different from kb-ui Dropdown — we bypass Dropdown and
 *      compose TextInput with a custom suffix.
 *   2. Description label is 13px medium while other labels are
 *      14px medium. Achieved via Field's `className` arbitrary
 *      selector — see field 4 below.
 *
 * v1 scope: icon picker and parent-category dropdown are click
 * stubs (console.log on click). No popover/menu UI. No form
 * validation. No required-field markers (Figma shows none).
 * ───────────────────────────────────────────────────────────── */

export type NewCategoryFormValues = {
  /** Icon identifier (free-form string for now; this is a placeholder field). */
  iconKey?: string;
  name: string;
  parentCategoryId?: string;
  description: string;
};

export type ParentCategoryOption = {
  id: string;
  label: string;
};

export type NewCategoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional parent-category options. When undefined, the dropdown is a static placeholder (no menu). */
  parentOptions?: ParentCategoryOption[];
  /**
   * Modal mode. `'create'` (default) renders the New Category chrome — title
   * "New Category" and CTA "Create Category". `'edit'` renders the Edit
   * Category chrome — title "Edit Category" and CTA "Save changes". Form
   * fields and submit shape are identical across modes.
   */
  mode?: 'create' | 'edit';
  /**
   * Submit handler — called with form values when the user clicks the primary
   * CTA. Receives all four fields regardless of mode.
   */
  onSubmit?: (values: NewCategoryFormValues) => void;
  /** Pre-fill values (rare — useful for editing). */
  initialValues?: Partial<NewCategoryFormValues>;
};

type FormState = {
  iconKey: string;
  name: string;
  parentCategoryId: string;
  description: string;
};

function buildInitialState(
  initialValues?: Partial<NewCategoryFormValues>,
): FormState {
  return {
    iconKey: initialValues?.iconKey ?? '',
    name: initialValues?.name ?? '',
    parentCategoryId: initialValues?.parentCategoryId ?? '',
    description: initialValues?.description ?? '',
  };
}

export function NewCategoryModal({
  open,
  onOpenChange,
  parentOptions,
  mode = 'create',
  onSubmit,
  initialValues,
}: NewCategoryModalProps) {
  const [state, setState] = React.useState<FormState>(() =>
    buildInitialState(initialValues),
  );

  const isEdit = mode === 'edit';
  const titleText = isEdit ? 'Edit Category' : 'New Category';
  const ctaLabel = isEdit ? 'Save changes' : 'Create Category';

  /* Figma shows the Parent Category field rendering the selected
   * parent's label inside the input (or the "Category name"
   * placeholder when nothing is picked). The 14/32 char counter
   * counts the rendered label's length. Both behaviors fall out
   * naturally from looking up the matching option below. */
  const selectedParent = React.useMemo(
    () =>
      parentOptions?.find((opt) => opt.id === state.parentCategoryId) ?? null,
    [parentOptions, state.parentCategoryId],
  );
  const parentDisplay = selectedParent?.label ?? '';

  const handleSubmit = () => {
    onSubmit?.({
      iconKey: state.iconKey || undefined,
      name: state.name,
      parentCategoryId: state.parentCategoryId || undefined,
      description: state.description,
    });
    onOpenChange(false);
  };

  /* Close X button — small unstyled button hosted in the Modal
   * header's `titleTrailing` slot. */
  const closeButton = (
    <button
      type="button"
      aria-label="Close"
      onClick={() => onOpenChange(false)}
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-[4px] cursor-pointer',
        'text-text-meta hover:bg-surface-muted',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
      )}
    >
      <XClose aria-hidden="true" className="h-[14px] w-[14px]" />
    </button>
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      width={420}
      radius={12}
      bodyPadding={20}
      footerLayout="section"
      title={titleText}
      titleTrailing={closeButton}
      /* Figma renders the title at 14px medium here, while the
       * Modal primitive's default is 16px medium (Convert-to-
       * External-KB style). Override via arbitrary selector on
       * the data-kb-part hook so we don't touch the primitive. */
      className="[&_[data-kb-part=modal-title]]:text-[14px] [&_[data-kb-part=modal-title]]:leading-5"
      footer={
        <Button variant="primary" onClick={handleSubmit}>
          {ctaLabel}
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Field 1 — Icon picker (click stub) */}
        <Field label="Icon">
          <button
            type="button"
            aria-label="Pick an icon"
            onClick={() => {
              // v1: no real picker — log for prototype reviewers.
              // eslint-disable-next-line no-console
              console.log('icon-picker open');
            }}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-[7px]',
              'border-[1.5px] border-dashed border-[#cbd5e1]',
              'hover:border-[#94a3b8] transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
            )}
          >
            <Mail01 className="h-[22px] w-[22px] text-[#6634ef]" />
          </button>
        </Field>

        {/* Field 2 — Category Name */}
        <Field label="Category Name">
          <TextInput
            value={state.name}
            onChange={(e) =>
              setState((s) => ({ ...s, name: e.target.value }))
            }
            placeholder="Category name"
            charCount={{ current: state.name.length, max: 32 }}
          />
        </Field>

        {/* Field 3 — Parent Category (Figma quirk: chevron BEFORE counter)
         *
         * TextInput renders charCount BEFORE suffix, so to get
         * chevron-first / counter-second on the right edge we
         * skip charCount entirely and pack BOTH into the suffix
         * slot — chevron, then counter.
         *
         * v1: clicking is a no-op (`console.log`). The real menu
         * UI is out of scope; the field looks-and-feels like a
         * dropdown but doesn't have one. */}
        <Field label="Parent Category">
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('parent-category open');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // eslint-disable-next-line no-console
                console.log('parent-category open');
              }
            }}
            className={cn(
              'cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-lg',
            )}
            aria-label="Choose parent category"
          >
            <TextInput
              value={parentDisplay}
              /* Read-only display: clicking the wrapper opens the
               * (future) menu. We still wire onChange so React
               * doesn't warn about controlled-without-onChange. */
              onChange={() => undefined}
              placeholder="Category name"
              suffix={
                <span className="flex items-center gap-1.5">
                  <ChevronDown
                    aria-hidden="true"
                    className="h-[14px] w-[14px] text-text-meta"
                  />
                  <span className="text-[12px] font-normal leading-[18px] text-text-muted tabular-nums">
                    {parentDisplay.length}/32
                  </span>
                </span>
              }
              inputClassName="cursor-pointer pointer-events-none"
            />
          </div>
        </Field>

        {/* Field 4 — Description (Figma quirk: 13px label instead of 14px) */}
        <Field
          label="Description"
          className="[&>div>label]:text-[13px] [&>div>label]:leading-[19px]"
        >
          <Textarea
            value={state.description}
            onChange={(e) =>
              setState((s) => ({ ...s, description: e.target.value }))
            }
            placeholder="Text goes here"
            initialHeight={80}
            charCount={{ current: state.description.length, max: 120 }}
          />
        </Field>
      </div>
    </Modal>
  );
}
