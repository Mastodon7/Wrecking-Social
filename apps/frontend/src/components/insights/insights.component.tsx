'use client';

import useSWR from 'swr';
import clsx from 'clsx';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { Button } from '@gitroom/react/form/button';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { PlatformIcon } from '@gitroom/frontend/components/ui/platform.icon.component';

type Group = { key: string; posts: number; avgScore: number; avgEngagement: number };

type InsightPost = {
  id: string;
  channel: { id: string; name: string; picture: string | null; provider: string };
  publishDate: string;
  url: string | null;
  text: string;
  mediaType: string;
  views: number | null;
  engagement: number;
  score: number;
  metrics: Record<string, number | null>;
};

type Insights = {
  timeZone: string;
  days: number;
  collectingSince: string | null;
  aiConfigured: boolean;
  totals: Record<string, number>;
  heatmap: Array<Array<{ posts: number; avgScore: number | null }>>;
  bestTimes: Array<{ weekday: string; hour: number; posts: number; avgScore: number }>;
  byPlatform: Group[];
  byWeekday: Group[];
  byMediaType: Group[];
  byLength: Group[];
  byHashtags: Group[];
  topPosts: InsightPost[];
  bottomPosts: InsightPost[];
};

type AiSummary = {
  notEnoughData?: boolean;
  headline?: string;
  findings?: Array<{ title: string; detail: string }>;
  recommendations?: Array<{ action: string; why: string }>;
  bestTimes?: string[];
  caveats?: string[];
  posts: number;
  generatedAt: string;
};

type AiStatus = { status: 'none' | 'running' | 'failed' | 'ready'; summary: AiSummary | null };

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PERIODS = [30, 90, 180, 365];

const number = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : Intl.NumberFormat('en-US', { notation: 'compact' }).format(value);

const hourLabel = (hour: number) =>
  `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'am' : 'pm'}`;

const scoreLabel = (score: number) => `${score.toFixed(1)}×`;

const Card: FC<{ title: string; children: any; className?: string }> = ({
  title,
  children,
  className,
}) => (
  <div className={clsx('bg-newBgColorInner rounded-[12px] p-[20px] flex flex-col gap-[14px]', className)}>
    <div className="text-[16px] font-[600]">{title}</div>
    {children}
  </div>
);

const GroupBars: FC<{ groups: Group[]; label?: (key: string) => string }> = ({
  groups,
  label = (k) => k,
}) => {
  const max = Math.max(...groups.map((g) => g.avgScore), 1);
  if (!groups.length) {
    return <div className="text-textItemBlur text-[14px]">No data yet</div>;
  }
  return (
    <div className="flex flex-col gap-[10px]">
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-[4px]">
          <div className="flex justify-between text-[13px]">
            <span className="capitalize">{label(group.key)}</span>
            <span className="text-textItemBlur">
              {scoreLabel(group.avgScore)} · {group.posts} post{group.posts === 1 ? '' : 's'}
            </span>
          </div>
          <div className="h-[8px] rounded-full bg-newBgLineColor overflow-hidden">
            <div
              className="h-full rounded-full bg-btnPrimary"
              style={{ width: `${Math.max((group.avgScore / max) * 100, 3)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const Heatmap: FC<{ heatmap: Insights['heatmap'] }> = ({ heatmap }) => {
  const max = Math.max(
    ...heatmap.flat().map((c) => c.avgScore || 0),
    1
  );
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px] flex flex-col gap-[3px]">
        <div className="flex gap-[3px] ps-[40px] text-[10px] text-textItemBlur">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="flex-1 text-center">
              {hour % 3 === 0 ? hourLabel(hour) : ''}
            </div>
          ))}
        </div>
        {heatmap.map((row, weekday) => (
          <div key={weekday} className="flex gap-[3px] items-center">
            <div className="w-[37px] text-[12px] text-textItemBlur">{WEEKDAYS[weekday]}</div>
            {row.map((cell, hour) => (
              <div
                key={hour}
                title={
                  cell.posts
                    ? `${WEEKDAYS[weekday]} ${hourLabel(hour)}: ${cell.posts} post${cell.posts === 1 ? '' : 's'}, ${scoreLabel(cell.avgScore || 0)} engagement vs. usual`
                    : `${WEEKDAYS[weekday]} ${hourLabel(hour)}: no posts`
                }
                className="flex-1 h-[22px] rounded-[4px] bg-newBgLineColor relative overflow-hidden"
              >
                {!!cell.posts && (
                  <div
                    className="absolute inset-0 bg-btnPrimary"
                    style={{ opacity: 0.15 + 0.85 * ((cell.avgScore || 0) / max) }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const PostRow: FC<{ post: InsightPost }> = ({ post }) => (
  <a
    href={post.url || undefined}
    target="_blank"
    rel="noreferrer"
    className="flex gap-[12px] items-start p-[10px] rounded-[8px] hover:bg-newBgLineColor"
  >
    <PlatformIcon identifier={post.channel.provider} size={24} />
    <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
      <div className="text-[13px] line-clamp-2">{post.text || '(no caption)'}</div>
      <div className="text-[12px] text-textItemBlur flex flex-wrap gap-x-[10px]">
        <span>{post.channel.name}</span>
        <span>{new Date(post.publishDate).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
        <span className="capitalize">{post.mediaType}</span>
        <span>{number(post.views)} views</span>
        <span>{number(post.engagement)} engagements</span>
      </div>
    </div>
    <div className="text-[14px] font-[600] whitespace-nowrap">{scoreLabel(post.score)}</div>
  </a>
);

const AiPanel: FC<{ days: number; tz: string; configured: boolean; posts: number }> = ({
  days,
  tz,
  configured,
  posts,
}) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const [polling, setPolling] = useState(false);
  const path = `/insights/ai?days=${days}&tz=${encodeURIComponent(tz)}`;
  const load = useCallback(async () => (await fetch(path)).json(), [path]);
  const { data, mutate } = useSWR<AiStatus>(configured ? path : null, load, {
    refreshInterval: polling ? 4000 : 0,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    setPolling(data?.status === 'running');
    if (data?.status === 'failed') {
      toaster.show('The AI analysis could not be created, please try again later', 'warning');
    }
  }, [data?.status]);

  const generate = useCallback(async () => {
    const response = await fetch(path, { method: 'POST' });
    if (!response.ok) {
      toaster.show('The AI analysis could not be started', 'warning');
      return;
    }
    mutate(await response.json(), { revalidate: false });
  }, [path]);

  if (!configured) {
    return (
      <Card title="AI analysis">
        <div className="text-[14px] text-textItemBlur">
          The AI assistant is not set up on this server yet. Add an
          ANTHROPIC_API_KEY to turn on written analysis of your posts.
        </div>
      </Card>
    );
  }

  const summary = data?.summary;
  const running = data?.status === 'running';

  return (
    <Card title="AI analysis">
      {!summary && !running && (
        <div className="flex flex-col gap-[12px] items-start">
          <div className="text-[14px] text-textItemBlur">
            Claude reads your post results and explains what gets the most
            engagement and when to post.
          </div>
          <Button onClick={generate} disabled={posts < 3}>
            Analyze my posts
          </Button>
          {posts < 3 && (
            <div className="text-[12px] text-textItemBlur">
              Needs at least 3 measured posts in this period.
            </div>
          )}
        </div>
      )}
      {running && (
        <div className="text-[14px] text-textItemBlur">
          Analyzing your posts… this usually takes under a minute.
        </div>
      )}
      {summary?.notEnoughData && !running && (
        <div className="text-[14px] text-textItemBlur">
          Not enough measured posts yet. Check back after a few more posts go out.
        </div>
      )}
      {summary && !summary.notEnoughData && !running && (
        <div className="flex flex-col gap-[18px]">
          <div className="text-[18px] font-[600]">{summary.headline}</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
            <div className="flex flex-col gap-[10px]">
              <div className="text-[13px] uppercase tracking-wide text-textItemBlur">What we found</div>
              {summary.findings?.map((f, i) => (
                <div key={i} className="text-[14px]">
                  <span className="font-[600]">{f.title}.</span> {f.detail}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-[10px]">
              <div className="text-[13px] uppercase tracking-wide text-textItemBlur">Do this next</div>
              {summary.recommendations?.map((r, i) => (
                <div key={i} className="text-[14px]">
                  <span className="font-[600]">{r.action}</span>{' '}
                  <span className="text-textItemBlur">{r.why}</span>
                </div>
              ))}
            </div>
          </div>
          {!!summary.bestTimes?.length && (
            <div className="flex flex-wrap gap-[8px]">
              {summary.bestTimes.map((t, i) => (
                <span key={i} className="text-[13px] px-[10px] py-[4px] rounded-full bg-newBgLineColor">
                  {t}
                </span>
              ))}
            </div>
          )}
          {!!summary.caveats?.length && (
            <div className="text-[12px] text-textItemBlur">{summary.caveats.join(' ')}</div>
          )}
          <div className="flex items-center gap-[12px]">
            <Button secondary onClick={generate}>
              Refresh analysis
            </Button>
            <span className="text-[12px] text-textItemBlur">
              Based on {summary.posts} posts · {new Date(summary.generatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export const InsightsComponent = () => {
  const fetch = useFetch();
  const [days, setDays] = useState(90);
  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    []
  );
  const path = `/insights?days=${days}&tz=${encodeURIComponent(tz)}`;
  const load = useCallback(async () => (await fetch(path)).json(), [path]);
  const { data, isLoading } = useSWR<Insights>(path, load, {
    revalidateOnFocus: false,
  });

  if (isLoading || !data) {
    return <LoadingComponent />;
  }

  return (
    <div className="flex flex-col gap-[16px] p-[20px] mobile:p-[12px] overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <div className="flex flex-col gap-[4px]">
          {/* the page title is already in the app header */}
          <div className="text-[13px] text-textItemBlur">
            What gets your posts the most engagement, and when. Times shown in {data.timeZone}.
            {data.collectingSince
              ? ` Collecting results daily since ${new Date(data.collectingSince).toLocaleDateString()}.`
              : ' Results are collected once a day; the first numbers appear within a day of your next post.'}
          </div>
        </div>
        <div className="flex gap-[6px]">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setDays(p)}
              className={clsx(
                'px-[12px] py-[6px] rounded-[8px] text-[13px]',
                p === days ? 'bg-btnPrimary text-white' : 'bg-newBgColorInner'
              )}
            >
              {p === 365 ? '1 year' : `${p} days`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-[12px]">
        {[
          ['Posts measured', data.totals.posts],
          ['Views', data.totals.views],
          ['Likes', data.totals.likes],
          ['Comments', data.totals.comments],
          ['Shares & saves', (data.totals.shares || 0) + (data.totals.saves || 0)],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-newBgColorInner rounded-[12px] p-[16px] flex flex-col gap-[4px]">
            <div className="text-[12px] text-textItemBlur">{label}</div>
            <div className="text-[24px] font-[600]">{number(value as number)}</div>
          </div>
        ))}
      </div>

      <AiPanel days={days} tz={tz} configured={data.aiConfigured} posts={data.totals.posts} />

      <Card title="When your posts do best">
        <div className="text-[13px] text-textItemBlur">
          Darker squares got more engagement than usual for that channel. Hover a square for details.
        </div>
        <Heatmap heatmap={data.heatmap} />
        {!!data.bestTimes.length && (
          <div className="flex flex-wrap gap-[8px] text-[13px]">
            <span className="text-textItemBlur">Best slots so far:</span>
            {data.bestTimes.map((t) => (
              <span key={`${t.weekday}-${t.hour}`} className="px-[10px] py-[2px] rounded-full bg-newBgLineColor">
                {t.weekday} {hourLabel(t.hour)} · {scoreLabel(t.avgScore)}
              </span>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
        <Card title="By platform">
          <GroupBars groups={data.byPlatform} />
        </Card>
        <Card title="By day of week">
          <GroupBars groups={data.byWeekday} />
        </Card>
        <Card title="By post type">
          <GroupBars groups={data.byMediaType} />
        </Card>
        <Card title="By caption length">
          <GroupBars groups={data.byLength} />
        </Card>
        <Card title="By number of hashtags">
          <GroupBars groups={data.byHashtags} />
        </Card>
        <Card title="How to read this">
          <div className="text-[13px] text-textItemBlur flex flex-col gap-[8px]">
            <div>
              Engagement is likes + comments + shares + saves, as each platform reports them.
            </div>
            <div>
              1.0× means typical for that channel; 2.0× means twice its usual engagement.
              Comparing each post with its own channel keeps a big account from drowning out a small one.
            </div>
            <div>Patterns built on only a few posts can change as more results come in.</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
        <Card title="Top posts">
          {data.topPosts.length ? (
            data.topPosts.map((p) => <PostRow key={p.id} post={p} />)
          ) : (
            <div className="text-textItemBlur text-[14px]">No measured posts yet</div>
          )}
        </Card>
        <Card title="Lowest posts">
          {data.bottomPosts.length ? (
            data.bottomPosts.map((p) => <PostRow key={p.id} post={p} />)
          ) : (
            <div className="text-textItemBlur text-[14px]">Shown once more than 5 posts are measured</div>
          )}
        </Card>
      </div>
    </div>
  );
};
