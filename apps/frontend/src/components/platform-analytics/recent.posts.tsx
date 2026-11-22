'use client';

import useSWR from 'swr';
import { FC, useCallback } from 'react';
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
                <th className="text-start font-[500] pb-[8px]">Posted</th>
                <th className="text-end font-[500] pb-[8px]">Views</th>
                <th className="text-end font-[500] pb-[8px]">Likes</th>
                <th className="text-end font-[500] pb-[8px]">Comments</th>
                <th className="text-end font-[500] pb-[8px]">Shares</th>
              </tr>
            </thead>
            <tbody>
              {data.map((post) => (
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
