// Right-docked sheet listing the customer conversations behind a
// suggestion. Port of kb-ui `SourcesSideSheet`, re-skinned with the old
// modal header and flat list rows. Radix Dialog supplies the focus trap,
// Esc, backdrop click, and focus return to the Sources link.
//
// Motion: the sheet slides + fades in from the right edge (240ms strong
// ease-out) and leaves faster (180ms); the backdrop fades 200/140ms.
// Keyframes rather than transitions because Radix waits for
// `animationend` before unmounting. Reduced motion: opacity only.

import * as Dialog from '@radix-ui/react-dialog';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { CloseGlyph } from '../components/ui/Modal';
import type { ConversationSource } from '../store/types';
import { CountPill } from './ReviewAtoms';

export interface SourcesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: ConversationSource[];
}

/** "Apr 24, 9:14 AM" — fixtures are authored in UTC. */
export function formatSourceTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export function SourcesSheet({ open, onOpenChange, sources }: SourcesSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={[
            'fixed inset-0 z-[1000000] bg-[rgba(0,0,0,0.4)]',
            'motion-safe:data-[state=open]:animate-lk-backdrop-in motion-safe:data-[state=closed]:animate-lk-backdrop-out',
            'motion-reduce:data-[state=open]:animate-lk-fade-in-reduced motion-reduce:data-[state=closed]:animate-lk-fade-out-reduced',
          ].join(' ')}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className={[
            'fixed inset-y-0 right-0 z-[1000001] box-border flex w-[420px] flex-col bg-white font-inter outline-none',
            'motion-safe:data-[state=open]:animate-lk-sheet-in motion-safe:data-[state=closed]:animate-lk-sheet-out',
            'motion-reduce:data-[state=open]:animate-lk-fade-in-reduced motion-reduce:data-[state=closed]:animate-lk-fade-out-reduced',
          ].join(' ')}
        >
          <div className="box-border flex h-[60px] shrink-0 items-center gap-[8px] bg-legacy-modal-header p-[20px]">
            <Dialog.Title className="m-0 p-0 text-[16px] leading-[20px] font-medium text-legacy-ink">Sources</Dialog.Title>
            <CountPill count={sources.length} label={`${sources.length} conversations`} />
            <Dialog.Close
              aria-label="Close"
              className="ml-auto flex cursor-pointer rounded-[4px] border-0 bg-transparent p-0 outline-none focus-visible:shadow-[0_0_0_2px_#1473e6]"
            >
              <CloseGlyph />
            </Dialog.Close>
          </div>

          {sources.length === 0 ? (
            <p className="m-0 px-[20px] py-[24px] text-[13px] leading-[20px] text-legacy-meta">
              No conversations are linked to this suggestion.
            </p>
          ) : (
            <ul aria-label="Conversations" className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-0">
              {sources.map((source) => (
                <li
                  key={source.id}
                  className="box-border border-0 border-b border-solid border-legacy-table-border px-[20px] py-[16px]"
                >
                  <div className="flex items-center gap-[8px]">
                    <MaterialIcon name="mail_outline" size={16} className="shrink-0 text-legacy-meta" />
                    <span
                      title={source.sender.email}
                      className="min-w-0 flex-1 truncate text-[14px] leading-[17px] font-medium text-legacy-ink"
                    >
                      {source.sender.name}
                    </span>
                    <time
                      dateTime={source.timestamp}
                      className="shrink-0 text-[12px] leading-[20px] font-normal text-legacy-meta"
                    >
                      {formatSourceTimestamp(source.timestamp)}
                    </time>
                  </div>
                  <p className="m-0 mt-[6px] truncate p-0 text-[13px] leading-[20px] font-medium text-legacy-body">
                    {source.subject}
                  </p>
                  <p className="m-0 truncate p-0 text-[13px] leading-[20px] font-normal text-legacy-meta">
                    {source.snippet}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
