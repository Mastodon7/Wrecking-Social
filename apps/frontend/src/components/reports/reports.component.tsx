'use client';

import useSWR from 'swr';
import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { getTimezone } from '@gitroom/frontend/components/layout/set.timezone';

type Setting = {
  brandName: string;
  logoUrl: string;
  accent: string;
  timezone: string;
  recipients: string;
  monthlyEmail: boolean;
};
type ReportRow = { id: string; token: string; month: string; auto: boolean; createdAt: string };

const input =
  'bg-input w-full px-[12px] h-[40px] outline-none border-fifth border rounded-[4px] text-inputText placeholder-inputText text-[14px]';

const months = () =>
  Array.from({ length: 12 }, (_, i) => dayjs().subtract(i, 'month')).map((d) => ({
    value: d.format('YYYY-MM'),
    label: d.format('MMMM YYYY') + (d.isSame(dayjs(), 'month') ? ' (so far)' : ''),
  }));

export const ReportsComponent = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const loadSetting = useCallback(async () => (await fetch('/reports/settings')).json(), []);
  const loadList = useCallback(async () => (await fetch('/reports')).json(), []);
  const { data: setting, mutate: mutateSetting } = useSWR<Setting>('report-setting', loadSetting, { revalidateOnFocus: false });
  const { data: list, isLoading, mutate } = useSWR<ReportRow[]>('report-list', loadList, { revalidateOnFocus: false });
  const [form, setForm] = useState<Setting | null>(null);
  const [month, setMonth] = useState(dayjs().subtract(1, 'month').format('YYYY-MM'));
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (setting && !form) {
      setForm({ ...setting, timezone: setting.timezone === 'UTC' ? getTimezone() : setting.timezone });
    }
  }, [setting]);

  const link = (token: string) => `${window.location.origin}/r/${token}`;

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const res = await fetch('/reports/settings', { method: 'POST', body: JSON.stringify(form) });
    setSaving(false);
    if (!res.ok) return toaster.show('Could not save. Check the logo URL and color.', 'warning');
    const saved = await res.json();
    setForm(saved);
    mutateSetting(saved);
    toaster.show('Report settings saved', 'success');
  };

  const create = async () => {
    setCreating(true);
    const res = await fetch('/reports', { method: 'POST', body: JSON.stringify({ month }) });
    setCreating(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return toaster.show(body?.message || 'Could not create the report', 'warning');
    mutate();
    window.open(link(body.token), '_blank');
  };

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(link(token));
      toaster.show('Link copied', 'success');
    } catch {
      toaster.show(link(token), 'success');
    }
  };

  const remove = async (row: ReportRow) => {
    if (!(await deleteDialog('Delete this report? Its link stops working.'))) return;
    await fetch(`/reports/${row.id}`, { method: 'DELETE' });
    mutate();
  };

  if (isLoading || !form) {
    return (
      <div className="bg-newBgColorInner p-[20px] flex flex-1 items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className="bg-newBgColorInner flex-1 flex flex-col p-[20px] mobile:p-[12px] gap-[24px] overflow-auto">
      <h2 className="text-[20px] font-[500]">Reports</h2>
      <div className="text-[14px] text-textItemBlur max-w-[760px]">
        A branded one-page report of a month: posts, views, engagement, change
        against the month before, results by platform and the top posts. Open
        it, click <b>Download PDF</b>, or send the link: anyone with the link
        can view it without an account. Reports use the numbers Insights
        collects daily, so they fill in as posts are measured.
      </div>

      <div className="flex flex-wrap items-end gap-[10px]">
        <label className="text-[13px] flex flex-col gap-[4px]">
          Month
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="bg-input border-fifth border rounded-[4px] h-[40px] px-[8px] text-[14px]">
            {months().map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={create} loading={creating}>
          Create report
        </Button>
      </div>

      <div className="flex flex-col gap-[8px]">
        {!list?.length && <div className="text-[14px] text-textItemBlur">No reports yet.</div>}
        {list?.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center gap-[12px] border border-newTableBorder rounded-[8px] p-[12px] bg-newBgColor text-[14px]">
            <div className="flex-1 min-w-[180px]">
              <b>{dayjs(`${row.month}-01`).format('MMMM YYYY')}</b>
              <span className="text-textItemBlur text-[12px]">
                {' '}· {row.auto ? 'sent automatically' : 'created'} {dayjs(row.createdAt).format('MMM D, h:mm A')}
              </span>
            </div>
            <a href={`/r/${row.token}`} target="_blank" rel="noreferrer" className="underline text-[13px]">
              Open
            </a>
            <button type="button" className="underline text-[13px]" onClick={() => copy(row.token)}>
              Copy link
            </button>
            <button type="button" className="underline text-[13px] text-red-400" onClick={() => remove(row)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="border border-newTableBorder rounded-[8px] p-[16px] flex flex-col gap-[12px] max-w-[640px]">
        <div className="text-[16px] font-[600]">Branding and monthly email</div>
        <input id="report-brand" className={input} placeholder="Brand name, e.g. 25M Printing" value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} maxLength={80} />
        <input id="report-logo" className={input} placeholder="Logo URL (https://…)" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
        <label className="text-[13px] flex items-center gap-[8px]">
          Brand color
          <input type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} />
          <span className="text-textItemBlur">· months follow the {form.timezone} time zone</span>
        </label>
        <label className="text-[13px] flex items-center gap-[8px] cursor-pointer">
          <input type="checkbox" checked={form.monthlyEmail} onChange={(e) => setForm({ ...form, monthlyEmail: e.target.checked })} />
          Email last month&apos;s report on the 1st of each month
        </label>
        <input
          id="report-recipients"
          className={input}
          placeholder="Send to (comma separated emails, up to 10)"
          value={form.recipients}
          onChange={(e) => setForm({ ...form, recipients: e.target.value })}
        />
        <div className="text-[12px] text-textItemBlur">
          YouTube and Google Business Profile numbers aren&apos;t included in saved reports, because Google statistics are kept for 30 days at most.
        </div>
        <div>
          <Button onClick={save} loading={saving}>
            Save settings
          </Button>
        </div>
      </div>
    </div>
  );
};
