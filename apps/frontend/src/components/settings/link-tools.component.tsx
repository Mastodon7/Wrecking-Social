'use client';

import React, { FC, useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';

type Tracking = {
  enabled: boolean;
  domains: string;
  medium: string;
  campaign: string;
};
export type HashtagGroup = { id: string; name: string; tags: string };

const card =
  'my-[16px] mt-[16px] bg-sixth border-fifth border rounded-[4px] p-[24px] flex flex-col gap-[16px]';
const input =
  'h-[40px] px-[12px] rounded-[6px] bg-newBgColorInner border border-newTextColor/10 text-[14px] outline-none focus:border-btnPrimary w-full';
const help = 'text-[12px] text-customColor18';

export const useHashtagGroups = () => {
  const fetch = useFetch();
  const load = useCallback(
    async () => (await fetch('/link-tools/hashtags')).json(),
    []
  );
  return useSWR<HashtagGroup[]>('hashtag-groups', load, {
    revalidateOnFocus: false,
  });
};

// UTM tags on our own links, added automatically when a post is scheduled
const LinkTracking: FC = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const load = useCallback(async () => (await fetch('/link-tools/utm')).json(), []);
  const { data, mutate } = useSWR<Tracking>('link-tracking', load, {
    revalidateOnFocus: false,
  });
  const [form, setForm] = useState<Tracking | null>(null);
  useEffect(() => {
    if (data && !form) {
      setForm(data);
    }
  }, [data]);

  const save = async () => {
    if (!form) return;
    const res = await fetch('/link-tools/utm', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      toaster.show('Could not save link tracking. Check the fields and try again.', 'warning');
      return;
    }
    const saved = await res.json();
    setForm(saved);
    mutate(saved);
    toaster.show('Link tracking saved', 'success');
  };

  if (!form) {
    return <div className={card}>Loading…</div>;
  }

  const example = form.domains.split(/[\s,]+/).filter(Boolean)[0] || '25mprinting.com';

  return (
    <div className={card}>
      <div>Link tracking (UTM tags)</div>
      <div className={help}>
        When a post is scheduled, links to your own websites get UTM tags, so
        Google Analytics (or Shopify) shows which platform and campaign each
        visit came from. Links to other sites are left alone.
      </div>
      <label className="flex items-center gap-[10px] text-[14px] cursor-pointer">
        <input
          id="utm-enabled"
          type="checkbox"
          checked={form.enabled}
          onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
        />
        Add UTM tags to links
      </label>
      <div className="flex flex-col gap-[6px]">
        <label htmlFor="utm-domains" className="text-[14px]">Your websites</label>
        <input
          id="utm-domains"
          className={input}
          placeholder="25mprinting.com, wreckingsocial.com"
          value={form.domains}
          onChange={(e) => setForm({ ...form, domains: e.target.value })}
        />
        <div className={help}>Only links to these domains (and their subdomains) are tagged.</div>
      </div>
      <div className="flex gap-[16px] mobile:flex-col">
        <div className="flex flex-col gap-[6px] flex-1">
          <label htmlFor="utm-medium" className="text-[14px]">Medium</label>
          <input
            id="utm-medium"
            className={input}
            placeholder="social"
            value={form.medium}
            onChange={(e) => setForm({ ...form, medium: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-[6px] flex-1">
          <label htmlFor="utm-campaign" className="text-[14px]">Campaign</label>
          <input
            id="utm-campaign"
            className={input}
            placeholder="wrecking-social"
            value={form.campaign}
            onChange={(e) => setForm({ ...form, campaign: e.target.value })}
          />
        </div>
      </div>
      <div className={`${help} break-all`}>
        Example: https://{example}/page?utm_source=instagram&amp;utm_medium=
        {form.medium || 'social'}&amp;utm_campaign={form.campaign || 'wrecking-social'}
      </div>
      <div>
        <button
          type="button"
          onClick={save}
          className="h-[40px] px-[20px] rounded-[8px] bg-btnPrimary text-white text-[14px] font-[600]"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// Saved hashtag sets the editor's # button inserts in one click
export const HashtagGroups: FC<{ onInsert?: (tags: string) => void }> = ({
  onInsert,
}) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const { data, mutate } = useHashtagGroups();
  const [editing, setEditing] = useState<{ id?: string; name: string; tags: string } | null>(null);

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.tags.trim()) {
      toaster.show('Give the group a name and at least one hashtag.', 'warning');
      return;
    }
    const res = await fetch(
      editing.id ? `/link-tools/hashtags/${editing.id}` : '/link-tools/hashtags',
      {
        method: editing.id ? 'PUT' : 'POST',
        body: JSON.stringify({ name: editing.name, tags: editing.tags }),
      }
    );
    if (!res.ok) {
      toaster.show('Could not save the hashtag group.', 'warning');
      return;
    }
    setEditing(null);
    mutate();
    toaster.show('Hashtag group saved', 'success');
  };

  const remove = async (group: HashtagGroup) => {
    if (!(await deleteDialog(`Delete the hashtag group "${group.name}"?`))) {
      return;
    }
    await fetch(`/link-tools/hashtags/${group.id}`, { method: 'DELETE' });
    mutate();
  };

  return (
    <div className={onInsert ? 'flex flex-col gap-[12px]' : card}>
      {!onInsert && (
        <>
          <div>Hashtag groups</div>
          <div className={help}>
            Save the hashtags you use often. In the post editor, the # button
            adds a whole group in one click.
          </div>
        </>
      )}
      {!data?.length && !editing && (
        <div className={help}>No hashtag groups yet.</div>
      )}
      {data?.map((group) => (
        <div
          key={group.id}
          className="flex items-start gap-[12px] border border-newTextColor/10 rounded-[8px] p-[12px]"
        >
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-[600]">{group.name}</div>
            <div className="text-[13px] text-textItemBlur break-words">{group.tags}</div>
          </div>
          {onInsert && (
            <button
              type="button"
              onClick={() => onInsert(group.tags)}
              className="h-[32px] px-[12px] rounded-[6px] bg-btnPrimary text-white text-[13px] font-[600] shrink-0"
            >
              Insert
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditing({ ...group })}
            className="h-[32px] px-[10px] rounded-[6px] border border-newTextColor/10 text-[13px] shrink-0"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => remove(group)}
            className="h-[32px] px-[10px] rounded-[6px] text-[#FF3F3F] text-[13px] shrink-0"
          >
            Delete
          </button>
        </div>
      ))}
      {editing ? (
        <div className="flex flex-col gap-[10px] border border-newTextColor/10 rounded-[8px] p-[12px]">
          <input
            id="hashtag-group-name"
            className={input}
            placeholder="Group name, e.g. Banners"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          />
          <textarea
            id="hashtag-group-tags"
            className={`${input} h-[80px] py-[8px]`}
            placeholder="#banners #customprinting #houston"
            value={editing.tags}
            onChange={(e) => setEditing({ ...editing, tags: e.target.value })}
          />
          <div className="flex gap-[8px]">
            <button
              type="button"
              onClick={save}
              className="h-[36px] px-[16px] rounded-[8px] bg-btnPrimary text-white text-[14px] font-[600]"
            >
              Save group
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="h-[36px] px-[16px] rounded-[8px] border border-newTextColor/10 text-[14px]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setEditing({ name: '', tags: '' })}
            className="h-[36px] px-[16px] rounded-[8px] border border-newTextColor/10 text-[14px] font-[600]"
          >
            + New hashtag group
          </button>
        </div>
      )}
    </div>
  );
};

const LinkToolsComponent = () => (
  <>
    <LinkTracking />
    <HashtagGroups />
  </>
);

export default LinkToolsComponent;
