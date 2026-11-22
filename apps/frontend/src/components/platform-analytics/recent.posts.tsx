'use client';

import useSWR from 'swr';
import { FC, useCallback, useMemo, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';

type RecentPost = {
  id: string;
  caption: string;
  thumbnail: string | null;
  url: string | null;
  publishedAt: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
};

type SortKey = 'publishedAt' | 'views' | 'likes' | 'comments' | 'shares';

const sortValue = (post: RecentPost, key: SortKey) =>
  key === 'publishedAt'
    ? post.publishedAt
      ? new Date(post.publishedAt).getTime()
      : null
    : post[key];

const number = (value: number | null) =>
  value === null ? '—' : Intl.NumberFormat('en-US').format(value);

// The account's most recent public posts with their numbers, straight from
// the platform (TikTok: video.list)
export const RecentPosts: FC<{ integrationId: string; title: string }> = ({
  integrationId,
  title,
}) => {
  const fetch = useFetch();
  const path = `/analytics/${integrationId}/recent-posts`;
  const load = useCallback(async () => (await fetch(path)).json(), [path]);
  const { data, isLoading } = useSWR<RecentPost[]>(path, load, {
    revalidateOnFocus: false,
  });

  // Click a column to sort by it, biggest/newest first; click again to flip.
  // Rows without a number always go last.
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({
    key: 'publishedAt',
    desc: true,
  });
  const rows = useMemo(() => {
    return [...(data || [])].sort((a, b) => {
      const x = sortValue(a, sort.key);
      const y = sortValue(b, sort.key);
      if (x === null && y === null) return 0;
      if (x === null) return 1;
      if (y === null) return -1;
      return sort.desc ? y - x : x - y;
    });
  }, [data, sort]);

  const header = (key: SortKey, label: string, align: 'start' | 'end') => {
    const active = sort.key === key;
    return (
      <th
        className={`font-[500] pb-[8px] ${
          align === 'end' ? 'text-end' : 'text-start'
        }`}
        aria-sort={active ? (sort.desc ? 'descending' : 'ascending') : 'none'}
      >
        <button
          type="button"
          onClick={() =>
            setSort(active ? { key, desc: !sort.desc } : { key, desc: true })
          }
          className={`inline-flex items-center gap-[4px] hover:text-newTextColor ${
            active ? 'text-newTextColor' : ''
          }`}
          title={
            key === 'publishedAt'
              ? 'Sort by date (newest / oldest)'
              : `Sort by ${label.toLowerCase()} (most / least)`
          }
        >
          {label}
          <span className={active ? '' : 'opacity-30'}>
            {active && !sort.desc ? '▲' : '▼'}
          </span>
        </button>
      </th>
    );
  };

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="text-[16px] font-[600]">{title}</div>
      {isLoading && <div className="text-[13px] text-textItemBlur">Loading…</div>}
      {!isLoading && !data?.length && (
        <div className="text-[13px] text-textItemBlur">
          No public videos found on this account yet.
        </div>
      )}
      {!!data?.length && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="text-textItemBlur text-start">
                <th className="text-start font-[500] pb-[8px]">Video</th>
                {header('publishedAt', 'Posted', 'start')}
                {header('views', 'Views', 'end')}
                {header('likes', 'Likes', 'end')}
                {header('comments', 'Comments', 'end')}
                {header('shares', 'Shares', 'end')}
              </tr>
            </thead>
            <tbody>
              {rows.map((post) => (
                <tr key={post.id} className="border-t border-newBgLineColor">
                  <td className="py-[8px] pe-[12px]">
                    <a
                      href={post.url || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-[10px]"
                    >
                      {post.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.thumbnail}
                          alt=""
                          className="w-[40px] h-[54px] rounded-[6px] object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-[40px] h-[54px] rounded-[6px] bg-newBgLineColor shrink-0" />
                      )}
                      <span className="line-clamp-2 max-w-[320px]">
                        {post.caption || '(no caption)'}
                      </span>
                    </a>
                  </td>
                  <td className="py-[8px] pe-[12px] whitespace-nowrap">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="py-[8px] text-end">{number(post.views)}</td>
                  <td className="py-[8px] text-end">{number(post.likes)}</td>
                  <td className="py-[8px] text-end">{number(post.comments)}</td>
                  <td className="py-[8px] text-end">{number(post.shares)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
