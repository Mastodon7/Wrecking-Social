'use client';

import { platformName } from '@gitroom/frontend/components/ui/platform.name';
import useSWR from 'swr';
import { FC, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { newDayjs } from '@gitroom/frontend/components/layout/set.timezone';

type Channel = { id: string; name: string; identifier: string; disabled?: boolean };
type Draft = { date: string; integrationIds: string[]; text: string };

const input =
  'bg-input w-full px-[12px] outline-none border-fifth border rounded-[4px] text-inputText placeholder-inputText text-[14px]';

// ---- CSV -----------------------------------------------------------------

// RFC 4180-ish: quoted fields, doubled quotes, commas and newlines inside quotes
export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
};

const TEMPLATE =
  'date,time,channels,text\n' +
  '2026-12-01,11:00,all,"New 3x6 vinyl banners are in! Same-day pickup this week."\n' +
  '2026-12-02,18:30,instagram;facebook,"Behind the scenes: how we print a banner in 20 minutes"\n';

type Row = { line: number; draft?: Draft; error?: string; channels: string[] };

const matchChannels = (value: string, channels: Channel[]) => {
  const wanted = value
    .split(/[;|]/)
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  if (!wanted.length) return { ids: [] as string[], missing: ['(none)'] };
  if (wanted.includes('all')) return { ids: channels.map((c) => c.id), missing: [] };
  const ids = new Set<string>();
  const missing: string[] = [];
  for (const w of wanted) {
    const found = channels.filter(
      (c) =>
        c.id === w ||
        c.name.toLowerCase() === w ||
        c.identifier.toLowerCase() === w ||
        c.identifier.toLowerCase().split('-')[0] === w
    );
    if (found.length) found.forEach((c) => ids.add(c.id));
    else missing.push(w);
  }
  return { ids: [...ids], missing };
};

const readRows = (text: string, channels: Channel[]): Row[] => {
  const table = parseCsv(text);
  if (!table.length) return [];
  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const [iDate, iTime, iChannels, iText] = [col('date'), col('time'), col('channels'), col('text')];
  if (iDate < 0 || iChannels < 0 || iText < 0) {
    return [{ line: 1, error: 'The first row must have the columns date, time, channels and text', channels: [] }];
  }
  return table.slice(1, 201).map((cells, index) => {
    const line = index + 2;
    const date = (cells[iDate] || '').trim();
    const time = (iTime >= 0 ? cells[iTime] || '' : '').trim() || '11:00';
    const text = (cells[iText] || '').trim();
    const { ids, missing } = matchChannels(cells[iChannels] || '', channels);
    const when = newDayjs(`${date}T${time.length === 4 ? '0' + time : time}`);
    const names = channels.filter((c) => ids.includes(c.id)).map((c) => c.name);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !when.isValid()) {
      return { line, error: `Date "${date} ${time}" should look like 2026-12-01 and 11:00`, channels: names };
    }
    if (missing.length) {
      return { line, error: `No channel called ${missing.join(', ')}`, channels: names };
    }
    if (!text) {
      return { line, error: 'The text is empty', channels: names };
    }
    return {
      line,
      channels: names,
      draft: { date: when.utc().format(), integrationIds: ids, text },
    };
  });
};

const CsvImport: FC<{ channels: Channel[]; onDone: () => void }> = ({ channels, onDone }) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);
  const good = rows.filter((r) => r.draft);

  const load = async (file?: File) => {
    if (!file) return;
    setRows(readRows(await file.text(), channels));
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wrecking-social-import.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const create = async () => {
    setSaving(true);
    const res = await fetch('/content-tools/drafts', {
      method: 'POST',
      body: JSON.stringify({ items: good.map((r) => r.draft) }),
    });
    setSaving(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      toaster.show(body?.message?.toString?.() || 'Could not create the drafts', 'warning');
      return;
    }
    toaster.show(
      `${body.created} drafts added to the calendar${body.failed?.length ? `, ${body.failed.length} failed` : ''}`,
      body.failed?.length ? 'warning' : 'success'
    );
    onDone();
  };

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="text-[13px] text-textItemBlur">
        One row per post, with the columns <b>date</b> (2026-12-01), <b>time</b> (14:30,
        your time zone), <b>channels</b> (<i>all</i>, a platform like <i>instagram</i>, or
        channel names, separated by <i>;</i>) and <b>text</b>. Up to 200 rows. Each row
        becomes a <b>draft</b> on the calendar; open it to add images and schedule it.
      </div>
      <div className="flex gap-[8px] flex-wrap items-center">
        <input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => load(e.target.files?.[0])}
          className="text-[14px]"
        />
        <button type="button" onClick={downloadTemplate} className="text-[13px] underline text-textItemBlur">
          Download a template
        </button>
      </div>
      {!!rows.length && (
        <div className="max-h-[320px] overflow-auto border border-newTextColor/10 rounded-[8px]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-textItemBlur text-start">
                <th className="text-start p-[8px]">Row</th>
                <th className="text-start p-[8px]">When</th>
                <th className="text-start p-[8px]">Channels</th>
                <th className="text-start p-[8px]">Text</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.line} className={clsx('border-t border-newTextColor/10', r.error && 'text-red-400')}>
                  <td className="p-[8px] align-top">{r.line}</td>
                  <td className="p-[8px] align-top whitespace-nowrap">
                    {r.draft ? newDayjs(r.draft.date).format('MMM D, h:mm A') : '—'}
                  </td>
                  <td className="p-[8px] align-top">{r.channels.join(', ') || '—'}</td>
                  <td className="p-[8px] align-top">
                    {r.error ? r.error : <span className="line-clamp-2">{r.draft!.text}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!!rows.length && (
        <div className="flex items-center gap-[12px]">
          <Button onClick={create} loading={saving} disabled={!good.length}>
            Create {good.length} draft{good.length === 1 ? '' : 's'}
          </Button>
          {rows.length !== good.length && (
            <span className="text-[13px] text-red-400">
              {rows.length - good.length} row(s) have problems and will be skipped
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ---- Repurpose -------------------------------------------------------------

type Suggestion = { channelId: string; angle: string; text: string; keep: boolean; date: string };

const Repurpose: FC<{ channels: Channel[]; onDone: () => void }> = ({ channels, onDone }) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const loadStatus = useCallback(async () => (await fetch('/content-tools/status')).json(), []);
  const { data: status } = useSWR<{ aiConfigured: boolean; transcriptionConfigured: boolean }>(
    'content-tools-status',
    loadStatus,
    { revalidateOnFocus: false }
  );
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [instructions, setInstructions] = useState('');
  const [count, setCount] = useState(7);
  const [picked, setPicked] = useState<string[]>(channels.slice(0, 3).map((c) => c.id));
  const [working, setWorking] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const name = (id: string) => channels.find((c) => c.id === id)?.name || 'Channel';

  const transcribe = async (file?: File) => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    setTranscribing(true);
    const res = await fetch('/content-tools/transcribe', { method: 'POST', body: form });
    setTranscribing(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      toaster.show(body?.message || 'Could not transcribe that audio', 'warning');
      return;
    }
    setText((t) => (t ? `${t}\n\n${body.text}` : body.text));
    toaster.show('Transcribed. Check the text, then write the posts.', 'success');
  };

  const generate = async () => {
    setWorking(true);
    const res = await fetch('/content-tools/repurpose', {
      method: 'POST',
      body: JSON.stringify({
        url: url.trim() || undefined,
        text: text.trim() || undefined,
        integrationIds: picked,
        count,
        instructions: instructions.trim() || undefined,
      }),
    });
    setWorking(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      toaster.show(body?.message?.toString?.() || 'Could not write the posts', 'warning');
      return;
    }
    // one a day from tomorrow at 11 AM, editable before saving
    const start = newDayjs().add(1, 'day').hour(11).minute(0).second(0).millisecond(0);
    setSuggestions(
      body.posts.map((p: any, i: number) => ({
        ...p,
        keep: true,
        date: start.add(i, 'day').format('YYYY-MM-DDTHH:mm'),
      }))
    );
  };

  const save = async () => {
    const items = suggestions
      .filter((s) => s.keep && s.text.trim())
      .map((s) => ({
        date: newDayjs(s.date).utc().format(),
        integrationIds: [s.channelId],
        text: s.text,
      }));
    if (!items.length) return;
    setSaving(true);
    const res = await fetch('/content-tools/drafts', { method: 'POST', body: JSON.stringify({ items }) });
    setSaving(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      toaster.show(body?.message?.toString?.() || 'Could not create the drafts', 'warning');
      return;
    }
    toaster.show(`${body.created} drafts added to the calendar`, 'success');
    onDone();
  };

  if (status && !status.aiConfigured) {
    return <div className="text-[14px]">The AI assistant is not set up on this server yet.</div>;
  }

  if (suggestions.length) {
    return (
      <div className="flex flex-col gap-[12px]">
        <div className="text-[13px] text-textItemBlur">
          Untick any you don&apos;t want, edit the text or date, then save them as drafts.
        </div>
        <div className="flex flex-col gap-[10px] max-h-[460px] overflow-auto pe-[4px]">
          {suggestions.map((s, i) => (
            <div key={i} className={clsx('border border-newTextColor/10 rounded-[8px] p-[10px] flex flex-col gap-[6px]', !s.keep && 'opacity-50')}>
              <div className="flex items-center gap-[10px] flex-wrap text-[13px]">
                <input
                  type="checkbox"
                  checked={s.keep}
                  aria-label="Keep this post"
                  onChange={(e) =>
                    setSuggestions((list) => list.map((x, j) => (j === i ? { ...x, keep: e.target.checked } : x)))
                  }
                />
                <b>{name(s.channelId)}</b>
                <span className="text-textItemBlur">{s.angle}</span>
                <input
                  type="datetime-local"
                  value={s.date}
                  onChange={(e) =>
                    setSuggestions((list) => list.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))
                  }
                  className="ms-auto bg-input border-fifth border rounded-[4px] px-[6px] h-[30px] text-[13px]"
                />
              </div>
              <textarea
                value={s.text}
                onChange={(e) =>
                  setSuggestions((list) => list.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))
                }
                className={`${input} min-h-[90px] py-[8px]`}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-[8px]">
          <Button onClick={save} loading={saving} disabled={!suggestions.some((s) => s.keep)}>
            Save {suggestions.filter((s) => s.keep).length} as drafts
          </Button>
          <Button secondary={true} onClick={() => setSuggestions([])}>
            Start over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="text-[13px] text-textItemBlur">
        Paste a link (a product page, blog post or article), some text, or a voice memo
        transcript. The AI writes a set of posts for the channels you pick, in each
        channel&apos;s brand voice, using only facts from what you give it.
      </div>
      <input
        id="repurpose-url"
        className={`${input} h-[40px]`}
        placeholder="https://25mprinting.com/products/vinyl-banners"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <textarea
        id="repurpose-text"
        className={`${input} min-h-[110px] py-[8px]`}
        placeholder="…or paste text, notes or a transcript here"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={30000}
      />
      {status?.transcriptionConfigured ? (
        <label className="text-[13px] flex items-center gap-[8px] cursor-pointer">
          <span className="underline">{transcribing ? 'Transcribing…' : 'Add a voice memo (audio file)'}</span>
          <input
            type="file"
            accept="audio/*,video/mp4"
            className="hidden"
            disabled={transcribing}
            onChange={(e) => transcribe(e.target.files?.[0])}
          />
        </label>
      ) : (
        <div className="text-[12px] text-textItemBlur">
          Voice memos need a Deepgram key on the server; until then, paste a transcript.
        </div>
      )}
      <input
        id="repurpose-instructions"
        className={`${input} h-[40px]`}
        placeholder="Optional: what to focus on, e.g. push the holiday sale, mention rush orders"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        maxLength={1000}
      />
      <div className="flex flex-col gap-[6px]">
        <div className="text-[13px]">Channels</div>
        <div className="flex flex-wrap gap-[8px]">
          {channels.map((c) => (
            <label key={c.id} className="flex items-center gap-[6px] text-[13px] border border-newTextColor/10 rounded-[6px] px-[8px] py-[4px] cursor-pointer">
              <input
                type="checkbox"
                checked={picked.includes(c.id)}
                onChange={(e) =>
                  setPicked((p) => (e.target.checked ? [...p, c.id] : p.filter((x) => x !== c.id)))
                }
              />
              {c.name}
              <span className="text-textItemBlur">· {platformName(c.identifier)}</span>
            </label>
          ))}
        </div>
      </div>
      <label className="text-[13px] flex items-center gap-[8px]">
        How many posts
        <select
          value={count}
          onChange={(e) => setCount(+e.target.value)}
          className="bg-input border-fifth border rounded-[4px] h-[32px] px-[6px]"
        >
          {[3, 5, 7, 10, 14].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <div>
        <Button
          onClick={generate}
          loading={working}
          disabled={!picked.length || (!url.trim() && text.trim().length < 40)}
        >
          ✦ Write the posts
        </Button>
      </div>
    </div>
  );
};

// ---- Entry point -------------------------------------------------------------

const ContentToolsModal: FC<{ channels: Channel[]; onDone: () => void }> = ({ channels, onDone }) => {
  const [tab, setTab] = useState<'repurpose' | 'csv'>('repurpose');
  return (
    <div className="flex flex-col gap-[16px] w-[720px] max-w-full">
      <div className="flex gap-[4px] p-[4px] border border-newTableBorder rounded-[8px] w-fit text-[14px]">
        {(
          [
            ['repurpose', '✦ Repurpose'],
            ['csv', 'Import CSV'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={clsx('px-[12px] h-[32px] rounded-[6px]', tab === key && 'bg-boxHover font-[600]')}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'repurpose' ? (
        <Repurpose channels={channels} onDone={onDone} />
      ) : (
        <CsvImport channels={channels} onDone={onDone} />
      )}
    </div>
  );
};

// Calendar button: opens the bulk tools
export const ContentToolsButton: FC<{ integrations: Channel[]; onCreated: () => void }> = ({
  integrations,
  onCreated,
}) => {
  const modals = useModals();
  const channels = useMemo(() => integrations.filter((c) => !c.disabled), [integrations]);
  if (!channels.length) return null;
  const open = () =>
    modals.openModal({
      title: 'Create in bulk',
      withCloseButton: true,
      children: (close) => (
        <ContentToolsModal
          channels={channels}
          onDone={() => {
            onCreated();
            close();
          }}
        />
      ),
    });
  return (
    <button
      type="button"
      onClick={open}
      className="h-[42px] px-[14px] rounded-[8px] border border-newTableBorder text-[14px] font-[500] whitespace-nowrap"
    >
      ✦ Create in bulk
    </button>
  );
};
