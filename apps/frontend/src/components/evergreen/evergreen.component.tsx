'use client';

import useSWR from 'swr';
import { FC, useCallback, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { getTimezone } from '@gitroom/frontend/components/layout/set.timezone';

type Category = {
  id: string;
  name: string;
  days: number[];
  time: string;
  timezone: string;
  integrationIds: string[];
  active: boolean;
  activeItems: number;
};
type Item = { id: string; text: string; active: boolean; useCount: number; lastUsedAt: string | null };
type Channel = { id: string; name: string; identifier: string; disabled?: boolean };
type Upcoming = { slot: string; category: string; asDraft: boolean; text: string };

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const input =
  'bg-input w-full px-[12px] outline-none border-fifth border rounded-[4px] text-inputText placeholder-inputText text-[14px]';

const useList = <T,>(key: string | null, path: string) => {
  const fetch = useFetch();
  const load = useCallback(async () => (await fetch(path)).json(), [path]);
  return useSWR<T>(key, load, { revalidateOnFocus: false });
};

const CategoryForm: FC<{
  channels: Channel[];
  initial?: Category;
  onSaved: () => void;
  onCancel: () => void;
}> = ({ channels, initial, onSaved, onCancel }) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const [name, setName] = useState(initial?.name || '');
  const [days, setDays] = useState<number[]>(initial?.days || [2, 4]);
  const [time, setTime] = useState(initial?.time || '11:00');
  const [picked, setPicked] = useState<string[]>(initial?.integrationIds || []);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !days.length || !picked.length) {
      toaster.show('Give it a name, at least one day and one channel.', 'warning');
      return;
    }
    setSaving(true);
    const res = await fetch(initial ? `/evergreen/categories/${initial.id}` : '/evergreen/categories', {
      method: initial ? 'PUT' : 'POST',
      body: JSON.stringify({
        name,
        days,
        time,
        timezone: initial?.timezone || getTimezone(),
        integrationIds: picked,
        active: initial?.active ?? true,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toaster.show('Could not save the category', 'warning');
      return;
    }
    onSaved();
  };

  return (
    <div className="flex flex-col gap-[12px] border border-newTextColor/10 rounded-[8px] p-[16px]">
      <input
        id="evergreen-name"
        className={`${input} h-[40px]`}
        placeholder="Category name, e.g. Printing tips"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
      />
      <div className="flex flex-wrap items-center gap-[8px] text-[13px]">
        <span>Goes out on</span>
        {DAYS.map((d, i) => (
          <button
            key={d}
            type="button"
            onClick={() =>
              setDays((list) => (list.includes(i + 1) ? list.filter((x) => x !== i + 1) : [...list, i + 1]))
            }
            className={clsx(
              'h-[30px] px-[10px] rounded-[6px] border',
              days.includes(i + 1) ? 'border-[#086b31] bg-[#086b31]/20' : 'border-newTextColor/10'
            )}
          >
            {d}
          </button>
        ))}
        <span>at</span>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-input border-fifth border rounded-[4px] h-[30px] px-[6px]"
        />
      </div>
      <div className="flex flex-wrap gap-[8px]">
        {channels.map((c) => (
          <label
            key={c.id}
            className="flex items-center gap-[6px] text-[13px] border border-newTextColor/10 rounded-[6px] px-[8px] py-[4px] cursor-pointer"
          >
            <input
              type="checkbox"
              checked={picked.includes(c.id)}
              onChange={(e) => setPicked((p) => (e.target.checked ? [...p, c.id] : p.filter((x) => x !== c.id)))}
            />
            {c.name}
          </label>
        ))}
      </div>
      <div className="flex gap-[8px]">
        <Button onClick={save} loading={saving}>
          {initial ? 'Save category' : 'Create category'}
        </Button>
        <Button secondary={true} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

const Items: FC<{ category: Category; onChange: () => void }> = ({ category, onChange }) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const { data, mutate } = useList<Item[]>(`evergreen-items-${category.id}`, `/evergreen/categories/${category.id}/items`);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);

  const add = async () => {
    if (!text.trim()) return;
    const res = await fetch(`/evergreen/categories/${category.id}/items`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return toaster.show('Could not add the post', 'warning');
    setText('');
    mutate();
    onChange();
  };

  const update = async (id: string, body: Partial<Item>) => {
    await fetch(`/evergreen/items/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    setEditing(null);
    mutate();
    onChange();
  };

  const remove = async (item: Item) => {
    if (!(await deleteDialog('Delete this evergreen post?'))) return;
    await fetch(`/evergreen/items/${item.id}`, { method: 'DELETE' });
    mutate();
    onChange();
  };

  return (
    <div className="flex flex-col gap-[8px]">
      {data?.map((item) => (
        <div key={item.id} className={clsx('border border-newTextColor/10 rounded-[8px] p-[10px] flex flex-col gap-[6px]', !item.active && 'opacity-50')}>
          {editing?.id === item.id ? (
            <>
              <textarea
                className={`${input} min-h-[90px] py-[8px]`}
                value={editing.text}
                onChange={(e) => setEditing({ id: item.id, text: e.target.value })}
              />
              <div className="flex gap-[8px]">
                <Button onClick={() => update(item.id, { text: editing.text })}>Save</Button>
                <Button secondary={true} onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-[14px] whitespace-pre-wrap break-words">{item.text}</div>
              <div className="flex flex-wrap items-center gap-[14px] text-[12px] text-textItemBlur">
                <span>
                  Used {item.useCount}×{item.lastUsedAt ? `, last ${dayjs(item.lastUsedAt).format('MMM D')}` : ''}
                </span>
                <button type="button" className="underline" onClick={() => setEditing({ id: item.id, text: item.text })}>
                  Edit
                </button>
                <button type="button" className="underline" onClick={() => update(item.id, { active: !item.active })}>
                  {item.active ? 'Pause' : 'Resume'}
                </button>
                <button type="button" className="underline text-red-400" onClick={() => remove(item)}>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
      <textarea
        id={`evergreen-new-${category.id}`}
        className={`${input} min-h-[80px] py-[8px]`}
        placeholder="Write a post that stays true for months (a tip, an FAQ answer, a product highlight)…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={10000}
      />
      <div>
        <Button onClick={add} disabled={!text.trim()} secondary={true}>
          + Add post
        </Button>
      </div>
    </div>
  );
};

export const EvergreenComponent = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const { data: categories, isLoading, mutate } = useList<Category[]>('evergreen-categories', '/evergreen/categories');
  const { data: channelData } = useList<{ integrations: Channel[] }>('evergreen-channels', '/integrations/list');
  const { data: upcoming, mutate: mutateUpcoming } = useList<Upcoming[]>('evergreen-upcoming', '/evergreen/upcoming');
  const channels = (channelData?.integrations || []).filter((c) => !c.disabled);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [planning, setPlanning] = useState(false);

  const plan = async () => {
    setPlanning(true);
    const res = await fetch('/evergreen/plan', { method: 'POST' });
    setPlanning(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return toaster.show('Could not fill the week', 'warning');
    toaster.show(
      body.created
        ? `${body.created} posts added to the calendar${body.drafts ? ` (${body.drafts} as drafts to review)` : ''}`
        : 'Every slot in the next 7 days is already filled',
      'success'
    );
    mutateUpcoming();
    mutate();
  };

  const toggle = async (c: Category) => {
    await fetch(`/evergreen/categories/${c.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...c, active: !c.active }),
    });
    mutate();
  };

  const remove = async (c: Category) => {
    if (!(await deleteDialog(`Delete the category "${c.name}" and its posts? Posts already on the calendar stay.`))) return;
    await fetch(`/evergreen/categories/${c.id}`, { method: 'DELETE' });
    mutate();
  };

  const names = (ids: string[]) => channels.filter((c) => ids.includes(c.id)).map((c) => c.name).join(', ');

  if (isLoading) {
    return (
      <div className="bg-newBgColorInner p-[20px] flex flex-1 items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className="bg-newBgColorInner flex-1 flex flex-col p-[20px] mobile:p-[12px] gap-[20px] overflow-auto">
      <div className="flex flex-wrap items-center gap-[12px]">
        <h2 className="flex-1 text-[20px] font-[500]">Evergreen library</h2>
        <Button secondary={true} onClick={plan} loading={planning}>
          Fill the next 7 days now
        </Button>
        <Button onClick={() => setCreating(true)}>+ New category</Button>
      </div>
      <div className="text-[14px] text-textItemBlur max-w-[760px]">
        Keep posts that stay true for months (tips, FAQs, product highlights,
        testimonials) in categories with a weekly schedule. Every few hours
        Wrecking Social fills the next 7 days: each slot gets the category&apos;s
        least recently used post, so everything rotates before anything
        repeats. Posts are scheduled; they&apos;re saved as drafts instead when
        approvals are on or a channel needs settings only the editor can fill
        (for example TikTok privacy or a YouTube title).
      </div>

      {creating && (
        <CategoryForm
          channels={channels}
          onSaved={() => {
            setCreating(false);
            mutate();
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {!categories?.length && !creating && (
        <div className="text-[14px] py-[40px] text-center text-textItemBlur">
          No categories yet. Create one, add a few posts, and the calendar fills itself.
        </div>
      )}

      <div className="flex flex-col gap-[12px]">
        {categories?.map((c) =>
          editing === c.id ? (
            <CategoryForm
              key={c.id}
              channels={channels}
              initial={c}
              onSaved={() => {
                setEditing(null);
                mutate();
              }}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div key={c.id} className={clsx('border border-newTableBorder rounded-[8px] p-[14px] flex flex-col gap-[10px] bg-newBgColor', !c.active && 'opacity-60')}>
              <div className="flex flex-wrap items-center gap-[10px]">
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[16px] font-[600]">{c.name}</div>
                  <div className="text-[13px] text-textItemBlur">
                    {c.days.map((d) => DAYS[d - 1]).join(', ')} at {c.time} ({c.timezone}) · {names(c.integrationIds) || 'no channels'} ·{' '}
                    {c.activeItems} post{c.activeItems === 1 ? '' : 's'}
                  </div>
                </div>
                <button type="button" className="text-[13px] underline" onClick={() => setOpen(open === c.id ? null : c.id)}>
                  {open === c.id ? 'Hide posts' : 'Posts'}
                </button>
                <button type="button" className="text-[13px] underline" onClick={() => setEditing(c.id)}>
                  Edit
                </button>
                <button type="button" className="text-[13px] underline" onClick={() => toggle(c)}>
                  {c.active ? 'Pause' : 'Resume'}
                </button>
                <button type="button" className="text-[13px] underline text-red-400" onClick={() => remove(c)}>
                  Delete
                </button>
              </div>
              {open === c.id && <Items category={c} onChange={() => mutate()} />}
            </div>
          )
        )}
      </div>

      {!!upcoming?.length && (
        <div className="flex flex-col gap-[8px]">
          <div className="text-[16px] font-[600]">Coming up</div>
          {upcoming.map((u, i) => (
            <div key={i} className="flex gap-[12px] text-[13px] border-b border-newTextColor/10 py-[6px]">
              <span className="whitespace-nowrap w-[150px] shrink-0">{dayjs(u.slot).format('ddd MMM D, h:mm A')}</span>
              <span className="whitespace-nowrap text-textItemBlur w-[140px] shrink-0 truncate">{u.category}</span>
              <span className="flex-1 truncate">{u.text}</span>
              {u.asDraft && <span className="text-[#a97a45] shrink-0">Draft</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
