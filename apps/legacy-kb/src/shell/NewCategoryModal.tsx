import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { Field, Modal } from '../components/ui/Modal';
import { TextInput } from '../components/ui/TextInput';
import { cn } from '../lib/cn';
import { slugify } from '../lib/format';

/** A starter set of Material Icons Outlined glyphs for the icon grid. */
const ICON_CHOICES = [
  'rocket_launch',
  'school',
  'flag',
  'settings',
  'smart_toy',
  'chat',
  'mail',
  'group',
  'security',
  'payments',
  'insights',
  'help_outline',
] as const;

export interface NewCategoryValues {
  title: string;
  description: string;
  icon: string;
  slug: string;
}

export interface NewCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingTitles: string[];
  onCreate: (values: NewCategoryValues) => void;
}

/**
 * "New category" modal (live chunk 270 `ke`). Mount only while open so
 * every open starts from an empty form.
 */
export function NewCategoryModal({ open, onOpenChange, existingTitles, onCreate }: NewCategoryModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const trimmed = title.trim();
  const duplicate = existingTitles.some((t) => t.toLowerCase() === trimmed.toLowerCase());
  const canCreate = trimmed.length > 0 && icon.length > 0 && !duplicate;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New category"
      description="Create a category to group related Help Center articles."
      footer={
        <>
          <Button variant="secondary" className="w-[100px]" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="w-[100px]"
            disabled={!canCreate}
            onClick={() => onCreate({ title: trimmed, description: description.trim(), icon, slug: slugify(trimmed) })}
          >
            Create
          </Button>
        </>
      }
    >
      <Field label="Category Icon" htmlFor="category-icon" required>
        <div className="relative flex flex-row items-center">
          <div
            id="category-icon"
            aria-label={icon ? `Selected icon: ${icon.replace(/_/g, ' ')}` : 'No icon selected'}
            className="box-border flex h-[50px] w-[50px] items-center justify-center rounded-[4px] border border-solid border-legacy-input-border bg-legacy-wash"
          >
            {icon ? (
              <MaterialIcon name={icon} size={30} />
            ) : (
              <span aria-hidden className="material-icons-outlined text-legacy-meta" style={{ fontSize: 20 }}>
                add_photo_alternate
              </span>
            )}
          </div>
          <button
            type="button"
            aria-describedby="category-icon"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((v) => !v)}
            className="ml-[24px] cursor-pointer border-0 bg-transparent p-0 text-right font-inter text-[14px] leading-[17px] font-medium tracking-[0.3px] text-legacy-blue outline-none focus-visible:underline"
          >
            {icon ? 'Change Icon' : 'Choose Icon'}
          </button>
        </div>
        {pickerOpen ? (
          <div
            role="listbox"
            aria-label="Category icons"
            className="grid w-[95%] gap-[10px] pt-[25px]"
            style={{ gridTemplateColumns: 'repeat(6, 3rem)' }}
          >
            {ICON_CHOICES.map((name) => (
              <button
                key={name}
                type="button"
                role="option"
                aria-selected={icon === name}
                aria-label={name.replace(/_/g, ' ')}
                onClick={() => {
                  setIcon(name);
                  setPickerOpen(false);
                }}
                className={cn(
                  'cursor-pointer border-0 bg-transparent p-[7px] text-center outline-none hover:shadow-[0px_0px_30px_rgb(0_0_0/14%)] focus-visible:shadow-[0_0_0_2px_#1473e6]',
                  icon === name && 'shadow-[0px_0px_30px_rgb(0_0_0/14%)]',
                )}
              >
                <MaterialIcon name={name} size={25} />
              </button>
            ))}
          </div>
        ) : null}
      </Field>
      <Field
        label="Category name"
        htmlFor="category-title"
        required
        error={duplicate ? 'A category exists with the same name.' : undefined}
      >
        <TextInput
          id="category-title"
          className="box-border w-full"
          invalid={duplicate}
          placeholder="Enter a category name"
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>
      <Field label="Description" htmlFor="category-description">
        <TextInput
          id="category-description"
          className="box-border w-full"
          placeholder="Describe what this category covers"
          value={description}
          maxLength={200}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
    </Modal>
  );
}
