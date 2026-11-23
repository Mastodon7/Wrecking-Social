'use client';

import useSWR from 'swr';
import { FC, useCallback, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';

type Link = { id: string; label: string; url: string };
type Page = {
  id: string;
  slug: string;
  title: string;
  bio: string;
  avatarUrl: string | null;
  accent: string;
  links: Link[];
  published: boolean;
};
type Stats = { views: number; links: { id: string; label: string; clicks: number }[] };
type Channel = { id: string; name: string; picture?: string; disabled?: boolean };

const input =
  'bg-input w-full px-[12px] h-[40px] outline-none border-fifth border rounded-[4px] text-inputText placeholder-inputText text-[14px]';

const origin = () => (typeof window !== 'undefined' ? window.location.origin : '');

const Editor: FC<{ initial?: Page; channels: Channel[]; onSaved: () => void; onCancel: () => void }> = ({
  initial,
  channels,
  onSaved,
  onCancel,
}) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const [page, setPage] = useState<Omit<Page, 'id'>>(
    initial || {
      slug: '',
      title: '',
      bio: '',
      avatarUrl: '',
      accent: '#086b31',
      links: [{ id: makeId(8), label: 'Shop', url: 'https://' }],
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<Page>) => setPage((p) => ({ ...p, ...patch }));
  const setLink = (i: number, patch: Partial<Link>) =>
    set({ links: page.links.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const move = (i: number, d: number) => {
    const links = [...page.links];
    const [l] = links.splice(i, 1);
    links.splice(Math.max(0, Math.min(links.length, i + d)), 0, l);
    set({ links });
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(initial ? `/bio-pages/${initial.id}` : '/bio-pages', {
      method: initial ? 'PUT' : 'POST',
      body: JSON.stringify({ ...page, avatarUrl: page.avatarUrl || undefined }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
      return toaster.show(message || 'Could not save the page', 'warning');
    }
    toaster.show('Page saved', 'success');
    onSaved();
  };

  return (
    <div className="flex gap-[24px] flex-wrap">
      <div className="flex-1 min-w-[300px] flex flex-col gap-[12px]">
        <label className="text-[13px] flex flex-col gap-[4px]">
          Address
          <div className="flex items-center gap-[6px]">
            <span className="text-textItemBlur whitespace-nowrap">{origin()}/b/</span>
            <input
              id="bio-slug"
              className={input}
              value={page.slug}
              placeholder="25mprinting"
              onChange={(e) => set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              maxLength={40}
            />
          </div>
        </label>
        <input id="bio-title" className={input} placeholder="Title, e.g. 25M Printing" value={page.title} onChange={(e) => set({ title: e.target.value })} maxLength={80} />
        <textarea
          id="bio-text"
          className={`${input} h-[70px] py-[8px]`}
          placeholder="One or two lines about you"
          value={page.bio}
          onChange={(e) => set({ bio: e.target.value })}
          maxLength={300}
        />
        <input id="bio-avatar" className={input} placeholder="Picture URL (https://…)" value={page.avatarUrl || ''} onChange={(e) => set({ avatarUrl: e.target.value })} />
        {!!channels.filter((c) => c.picture).length && (
          <div className="flex items-center gap-[8px] flex-wrap text-[12px] text-textItemBlur">
            Use a channel picture:
            {channels
              .filter((c) => c.picture)
              .map((c) => (
                <button key={c.id} type="button" onClick={() => set({ avatarUrl: c.picture! })} title={c.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.picture} alt={c.name} className="w-[28px] h-[28px] rounded-full" />
                </button>
              ))}
          </div>
        )}
        <label className="text-[13px] flex items-center gap-[8px]">
          Button color
          <input type="color" value={page.accent} onChange={(e) => set({ accent: e.target.value })} />
        </label>
        <div className="text-[14px] font-[600] mt-[8px]">Links</div>
        {page.links.map((link, i) => (
          <div key={link.id} className="flex gap-[6px] items-center">
            <div className="flex flex-col">
              <button type="button" aria-label="Move up" onClick={() => move(i, -1)} className="text-[11px] leading-[12px]">▲</button>
              <button type="button" aria-label="Move down" onClick={() => move(i, 1)} className="text-[11px] leading-[12px]">▼</button>
            </div>
            <input className={`${input} w-[38%]`} placeholder="Label" value={link.label} onChange={(e) => setLink(i, { label: e.target.value })} maxLength={80} />
            <input className={input} placeholder="https://" value={link.url} onChange={(e) => setLink(i, { url: e.target.value })} />
            <button type="button" aria-label="Remove link" className="text-red-400 px-[6px]" onClick={() => set({ links: page.links.filter((_, j) => j !== i) })}>
              ✕
            </button>
          </div>
        ))}
        <div>
          <Button secondary={true} onClick={() => set({ links: [...page.links, { id: makeId(8), label: '', url: 'https://' }] })}>
            + Add link
          </Button>
        </div>
        <label className="text-[13px] flex items-center gap-[8px]">
          <input type="checkbox" checked={page.published} onChange={(e) => set({ published: e.target.checked })} />
          Published
        </label>
        <div className="flex gap-[8px]">
          <Button onClick={save} loading={saving}>
            Save page
          </Button>
          <Button secondary={true} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
      <div className="w-[300px] shrink-0 rounded-[16px] bg-[#f5f6f4] text-[#16181d] p-[24px] flex flex-col items-center gap-[10px]">
        <div className="text-[11px] text-[#8a8f99] uppercase tracking-wider">Preview</div>
        {page.avatarUrl && /^https?:\/\//.test(page.avatarUrl) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.avatarUrl} alt="" className="w-[72px] h-[72px] rounded-full object-cover" />
        )}
        <div className="font-[700] text-[18px] text-center">{page.title || 'Your title'}</div>
        {!!page.bio && <div className="text-[13px] text-center text-[#555b66] whitespace-pre-line">{page.bio}</div>}
        {page.links
          .filter((l) => l.label)
          .map((l) => (
            <div key={l.id} className="w-full text-center rounded-[12px] bg-white py-[10px] font-[600] text-[14px]" style={{ border: `2px solid ${page.accent}` }}>
              {l.label}
            </div>
          ))}
      </div>
    </div>
  );
};

const PageStats: FC<{ id: string }> = ({ id }) => {
  const fetch = useFetch();
  const load = useCallback(async () => (await fetch(`/bio-pages/${id}/stats`)).json(), [id]);
  const { data } = useSWR<Stats>(`bio-stats-${id}`, load, { revalidateOnFocus: false });
  if (!data) return null;
  return (
    <div className="text-[13px] text-textItemBlur">
      Last 30 days: <b className="text-textColor">{data.views}</b> views
      {data.links.map((l) => (
        <span key={l.id}>
          {' '}· {l.label}: <b className="text-textColor">{l.clicks}</b>
        </span>
      ))}
    </div>
  );
};

export const BioComponent = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const loadPages = useCallback(async () => (await fetch('/bio-pages')).json(), []);
  const loadChannels = useCallback(async () => (await (await fetch('/integrations/list')).json()).integrations, []);
  const { data: pages, isLoading, mutate } = useSWR<Page[]>('bio-pages', loadPages, { revalidateOnFocus: false });
  const { data: channels } = useSWR<Channel[]>('bio-channels', loadChannels, { revalidateOnFocus: false });
  const [editing, setEditing] = useState<string | 'new' | null>(null);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toaster.show('Link copied', 'success');
    } catch {
      toaster.show(url, 'success');
    }
  };

  const remove = async (page: Page) => {
    if (!(await deleteDialog(`Delete the page /b/${page.slug}? The address stops working.`))) return;
    await fetch(`/bio-pages/${page.id}`, { method: 'DELETE' });
    mutate();
  };

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
        <h2 className="flex-1 text-[20px] font-[500]">Link in bio</h2>
        {editing === null && <Button onClick={() => setEditing('new')}>+ New page</Button>}
      </div>
      <div className="text-[14px] text-textItemBlur max-w-[760px]">
        One link for your Instagram, TikTok and other bios that lists everything
        you want people to visit: your store, a sale, a quote form. Every click
        is counted, and when Link tracking is on, links to your own sites carry
        UTM tags (source: link-in-bio) so you can see the sales in Google
        Analytics or Shopify. Nothing about visitors is stored.
      </div>
      {editing === 'new' && (
        <Editor channels={channels || []} onSaved={() => { setEditing(null); mutate(); }} onCancel={() => setEditing(null)} />
      )}
      {!pages?.length && editing === null && (
        <div className="text-[14px] py-[40px] text-center text-textItemBlur">No pages yet.</div>
      )}
      {pages?.map((page) =>
        editing === page.id ? (
          <Editor key={page.id} initial={page} channels={channels || []} onSaved={() => { setEditing(null); mutate(); }} onCancel={() => setEditing(null)} />
        ) : (
          <div key={page.id} className="border border-newTableBorder rounded-[8px] p-[14px] flex flex-col gap-[8px] bg-newBgColor">
            <div className="flex flex-wrap items-center gap-[10px]">
              <div className="flex-1 min-w-[200px]">
                <div className="text-[16px] font-[600]">
                  {page.title} {!page.published && <span className="text-[12px] text-[#a97a45]">(not published)</span>}
                </div>
                <a href={`/b/${page.slug}`} target="_blank" rel="noreferrer" className="text-[13px] underline text-textItemBlur">
                  {origin()}/b/{page.slug}
                </a>
              </div>
              <button type="button" className="text-[13px] underline" onClick={() => copy(`${origin()}/b/${page.slug}`)}>
                Copy link
              </button>
              <button type="button" className="text-[13px] underline" onClick={() => setEditing(page.id)}>
                Edit
              </button>
              <button type="button" className="text-[13px] underline text-red-400" onClick={() => remove(page)}>
                Delete
              </button>
            </div>
            <PageStats id={page.id} />
          </div>
        )
      )}
    </div>
  );
};
