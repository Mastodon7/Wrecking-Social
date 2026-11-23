'use client';

import { FC, useCallback, useState } from 'react';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { useClickOutside } from '@mantine/hooks';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import {
  getTimezone,
  newDayjs,
} from '@gitroom/frontend/components/layout/set.timezone';

type Slot = { weekday: string; hour: number; posts: number; avgScore: number };
type BestTime = {
  basis: 'channels' | 'account' | 'default';
  measuredPosts: number;
  slots: Slot[];
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// The next time this weekday + hour comes around in the user's timezone,
// at least 15 minutes from now
export const nextOccurrence = (weekday: string, hour: number) => {
  const now = newDayjs();
  const target = WEEKDAYS.indexOf(weekday);
  // dayjs counts Sunday as 0, our list starts on Monday
  const today = (now.day() + 6) % 7;
  let candidate = now
    .add((target - today + 7) % 7, 'day')
    .hour(hour)
    .minute(0)
    .second(0)
    .millisecond(0);
  if (!candidate.isAfter(now.add(15, 'minute'))) {
    candidate = candidate.add(7, 'day');
  }
  return candidate;
};

const hourLabel = (hour: number) =>
  dayjs().hour(hour).minute(0).format('h A');

const basisLabel = (data: BestTime) => {
  if (data.basis === 'channels') {
    return `Based on ${data.measuredPosts} measured posts on these channels.`;
  }
  if (data.basis === 'account') {
    return `Not enough history on these channels yet, so this uses all ${data.measuredPosts} measured posts on the account.`;
  }
  return 'Not enough measured posts yet. These are common starting times; they get replaced by your own results as Insights collects data.';
};

// "Best time" next to the date: suggests the hours that got the most
// engagement (from Insights) and moves the post to the next one picked
export const BestTimeButton: FC<{
  integrationIds: string[];
  onPick: (date: dayjs.Dayjs) => void;
  sheet?: boolean;
}> = ({ integrationIds, onPick, sheet }) => {
  const fetch = useFetch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BestTime | null>(null);
  const [failed, setFailed] = useState(false);
  const ref = useClickOutside(() => open && !sheet && setOpen(false));

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const params = new URLSearchParams({
        integrations: integrationIds.join(','),
        tz: getTimezone(),
      });
      const res = await fetch(`/insights/best-time?${params.toString()}`);
      if (!res.ok) {
        throw new Error();
      }
      setData(await res.json());
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [integrationIds.join(',')]);

  const toggle = () => {
    if (!open) {
      load();
    }
    setOpen(!open);
  };

  const list = (
    <div className="flex flex-col gap-[6px]">
      {loading && <div className="text-[13px] text-textItemBlur">Finding the best time…</div>}
      {failed && (
        <div className="text-[13px] text-textItemBlur">
          Could not load suggestions. Try again in a moment.
        </div>
      )}
      {!loading &&
        !failed &&
        data?.slots.map((slot, index) => {
          const date = nextOccurrence(slot.weekday, slot.hour);
          return (
            <button
              type="button"
              key={`${slot.weekday}-${slot.hour}`}
              onClick={() => {
                onPick(date);
                setOpen(false);
              }}
              className="text-start rounded-[8px] px-[12px] py-[8px] hover:bg-newBgColor border border-newTextColor/10 flex flex-col"
            >
              <span className="text-[14px] font-[600]">
                {index === 0 && data.basis !== 'default' ? '★ ' : ''}
                {date.format('ddd, MMM D')} at {hourLabel(slot.hour)}
              </span>
              <span className="text-[12px] text-textItemBlur">
                {data.basis === 'default'
                  ? 'Common starting time'
                  : `${slot.avgScore.toFixed(1)}× the usual engagement · ${slot.posts} posts`}
              </span>
            </button>
          );
        })}
      {!loading && !failed && data && (
        <div className="text-[12px] text-textItemBlur pt-[4px]">{basisLabel(data)}</div>
      )}
    </div>
  );

  if (sheet) {
    return (
      <div className="flex flex-col gap-[8px]">
        <button
          type="button"
          onClick={toggle}
          className="h-[40px] rounded-[8px] border border-newTextColor/10 text-[14px] font-[600]"
        >
          {open ? 'Hide best times' : '✦ Suggest the best time'}
        </button>
        {open && list}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={!integrationIds.length}
        onClick={toggle}
        title={
          integrationIds.length
            ? 'Suggest the time this post is likely to get the most engagement'
            : 'Pick a channel first'
        }
        className={clsx(
          'h-[44px] px-[14px] rounded-[8px] border text-[15px] font-[600] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          open ? 'border-[#086b31]' : 'border-newTextColor/10'
        )}
      >
        ✦ Best time
      </button>
      {open && (
        <div className="z-[300] absolute end-0 bottom-[100%] -translate-y-[10px] w-[300px] bg-newBgColorInner p-[12px] menu-shadow rounded-[8px]">
          {list}
        </div>
      )}
    </div>
  );
};
