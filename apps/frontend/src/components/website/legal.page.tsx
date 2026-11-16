import { FC, ReactNode } from 'react';

export const LegalPage: FC<{
  title: string;
  updated: string;
  children: ReactNode;
}> = ({ title, updated, children }) => {
  return (
    <article className="max-w-[860px] mx-auto px-[16px] py-[56px]">
      <h1 className="ws-display text-[36px] md:text-[46px] font-[800] text-white leading-[1.1]">
        {title}
      </h1>
      <p className="mt-[10px] text-[15px] text-ws-muted">
        Last updated: {updated}
      </p>
      <div className="ws-legal mt-[24px] text-[16px]">{children}</div>
    </article>
  );
};
