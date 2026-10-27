import { Link } from 'react-router-dom';
import { noArticleIllustration } from '../assets/legacy';

export interface NotFoundProps {
  title?: string;
  message?: string;
}

/** Shared "nothing here" state for unknown categories/articles. */
export function NotFound({
  title = 'This page doesn’t exist',
  message = 'It may have been moved or deleted.',
}: NotFoundProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center font-inter">
      <img width={141} height={103} src={noArticleIllustration} alt="" />
      <p className="mx-0 mt-[40px] mb-[8px] p-0 text-[14px] leading-[17px] font-medium text-legacy-ink">{title}</p>
      <p className="m-0 p-0 text-[13px] leading-[17px] font-medium text-legacy-meta">{message}</p>
      <Link
        to="/product/category/getting-started"
        className="mt-[24px] text-[14px] leading-[17px] font-medium text-legacy-blue no-underline hover:underline"
      >
        Go to Getting started
      </Link>
    </div>
  );
}
