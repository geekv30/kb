import { noArticleIllustration } from '../../assets/legacy';

export interface EmptyStateProps {
  title: string;
  info: string;
}

/*
 * Live table empty state (chunk 854 `He`/`Me`): NoArticlePlace 141x103,
 * title 14/17 500 #09274a 40px below, info 13/17 500 #4e6382 8px below.
 * Centered in the nearest positioned ancestor (the table box).
 */
export function EmptyState({ title, info }: EmptyStateProps) {
  return (
    <div className="absolute top-1/2 left-1/2 box-border flex w-auto -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
      <img width={141} height={103} src={noArticleIllustration} alt="" />
      <p className="mx-0 mt-[40px] mb-[8px] w-auto p-0 text-center text-[14px] leading-[17px] font-medium text-legacy-ink">
        {title}
      </p>
      <p className="m-0 w-auto p-0 text-center text-[13px] leading-[17px] font-medium text-legacy-meta">{info}</p>
    </div>
  );
}
