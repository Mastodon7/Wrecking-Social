'use client';

import useSWR from 'swr';
import { FC, useCallback, useState } from 'react';
import clsx from 'clsx';
import ImageWithFallback from '@gitroom/react/helpers/image.with.fallback';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { fromUtc } from '@gitroom/frontend/components/layout/set.timezone';

type Setting = { required: boolean; canApprove: boolean };
type GroupApproval = {
  required: boolean;
  status: 'PENDING' | 'CHANGES_REQUESTED' | 'APPROVED' | null;
  note?: string | null;
  submittedBy?: string;
  decidedBy?: string | null;
};
type ApprovalItem = {
  group: string;
  status: 'PENDING' | 'CHANGES_REQUESTED';
  note: string | null;
  submittedBy: string;
  updatedAt: string;
  preview: string;
  post: { id: string; group: string; publishDate: string; state: string; integration: string };
  channels: { id: string; name: string; picture?: string; providerIdentifier: string }[];
};

const options = { revalidateOnFocus: false };

export const useApprovalSetting = () => {
  const fetch = useFetch();
  const load = useCallback(async () => (await fetch('/approvals/setting')).json(), []);
  return useSWR<Setting>('approval-setting', load, options);
};

const useApprovalList = (enabled: boolean) => {
  const fetch = useFetch();
  const load = useCallback(async () => (await fetch('/approvals')).json(), []);
  return useSWR<{ required: boolean; items: ApprovalItem[] }>(
    enabled ? 'approval-list' : null,
    load,
    { ...options, refreshInterval: 120000 }
  );
};

// Settings card: admins turn approvals on or off
export const ApprovalSettingCard: FC = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const { data, mutate } = useApprovalSetting();
  if (!data?.canApprove) {
    return null;
  }
  const toggle = async (required: boolean) => {
    const res = await fetch('/approvals/setting', {
      method: 'POST',
      body: JSON.stringify({ required }),
    });
    if (!res.ok) {
      toaster.show('Could not change the approval setting', 'warning');
      return;
    }
    mutate({ ...data, required });
    toaster.show(required ? 'Approvals turned on' : 'Approvals turned off', 'success');
  };
  return (
    <div className="my-[16px] mt-[16px] bg-sixth border-fifth border rounded-[4px] p-[24px] flex flex-col gap-[12px]">
      <div>Post approvals</div>
      <div className="text-[12px] text-customColor18">
        When this is on, team members with the User role can&apos;t schedule or
        publish. They save posts and click &quot;Submit for approval&quot;;
        admins get a notification, review the post from &quot;Awaiting
        approval&quot; on the calendar, and either schedule it (that approves
        it) or request changes. Admins&apos; own posts are not affected.
      </div>
      <label className="flex items-center gap-[10px] text-[14px] cursor-pointer">
        <input
          id="approvals-required"
          type="checkbox"
          checked={data.required}
          onChange={(e) => toggle(e.target.checked)}
        />
        Require approval for team members&apos; posts
      </label>
    </div>
  );
};

// Composer banner: where this post stands, and "Request changes" for admins
export const ApprovalBanner: FC<{ group?: string }> = ({ group }) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const { data: setting } = useApprovalSetting();
  const load = useCallback(
    async () => (await fetch(`/approvals/group/${group}`)).json(),
    [group]
  );
  const { data, mutate } = useSWR<GroupApproval>(
    group ? `approval-group-${group}` : null,
    load,
    options
  );
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState('');

  if (!group || !data?.status || data.status === 'APPROVED') {
    return null;
  }

  const send = async () => {
    const res = await fetch(`/approvals/group/${group}/request-changes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
    if (!res.ok) {
      toaster.show('Could not send the request', 'warning');
      return;
    }
    setAsking(false);
    setNote('');
    mutate();
    toaster.show('Changes requested. The author was notified.', 'success');
  };

  return (
    <div
      className={clsx(
        'mx-[20px] mt-[12px] p-[12px] rounded-[8px] text-[14px] flex flex-col gap-[8px] border',
        data.status === 'PENDING'
          ? 'border-[#a97a45]/50 bg-[#a97a45]/10'
          : 'border-red-500/50 bg-red-500/10'
      )}
    >
      <div>
        {data.status === 'PENDING' ? (
          <>
            <b>Awaiting approval</b>, submitted by {data.submittedBy}.
            {setting?.canApprove && ' Schedule it to approve, or request changes.'}
          </>
        ) : (
          <>
            <b>Changes requested</b>
            {data.decidedBy ? ` by ${data.decidedBy}` : ''}
            {data.note ? `: "${data.note}"` : '.'} Edit the post and submit it again.
          </>
        )}
      </div>
      {setting?.canApprove && data.status === 'PENDING' && (
        <div className="flex flex-col gap-[8px]">
          {asking ? (
            <>
              <textarea
                id="approval-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                placeholder="What should change?"
                className="bg-input min-h-[70px] p-[10px] outline-none border-fifth border rounded-[4px] text-inputText placeholder-inputText"
              />
              <div className="flex gap-[8px]">
                <button
                  type="button"
                  onClick={send}
                  className="h-[34px] px-[14px] rounded-[6px] bg-red-600 text-white text-[13px] font-[600]"
                >
                  Send request
                </button>
                <button
                  type="button"
                  onClick={() => setAsking(false)}
                  className="h-[34px] px-[14px] rounded-[6px] border border-newTextColor/10 text-[13px]"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setAsking(true)}
                className="h-[34px] px-[14px] rounded-[6px] border border-newTextColor/20 text-[13px] font-[600]"
              >
                Request changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ApprovalList: FC<{
  items: ApprovalItem[];
  onOpen: (item: ApprovalItem) => void;
}> = ({ items, onOpen }) => (
  <div className="flex flex-col gap-[10px] w-[620px] max-w-full">
    {!items.length && (
      <div className="text-[14px] text-textItemBlur">Nothing is waiting for approval.</div>
    )}
    {items.map((item) => (
      <div
        key={item.group}
        className="flex gap-[12px] items-start border border-newTextColor/10 rounded-[8px] p-[12px]"
      >
        <div className="flex -space-x-[8px] shrink-0">
          {item.channels.slice(0, 3).map((c) => (
            <ImageWithFallback
              key={c.id}
              fallbackSrc={`/icons/platforms/${c.providerIdentifier}.png`}
              src={c.picture || `/icons/platforms/${c.providerIdentifier}.png`}
              className="rounded-full border-2 border-newBgColorInner"
              alt={c.name}
              width={32}
              height={32}
            />
          ))}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
          <div className="text-[14px] break-words">{item.preview || '(no text)'}</div>
          <div className="text-[12px] text-textItemBlur">
            {item.status === 'PENDING' ? 'Waiting' : 'Changes requested'} · by{' '}
            {item.submittedBy} · for{' '}
            {fromUtc(item.post.publishDate).format('MMM D, h:mm A')} ·{' '}
            {item.channels.map((c) => c.name).join(', ')}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpen(item)}
          className="h-[32px] px-[12px] rounded-[6px] bg-btnPrimary text-white text-[13px] font-[600] shrink-0"
        >
          Review
        </button>
      </div>
    ))}
  </div>
);

// Calendar button: "Awaiting approval (3)", opens the list; Review opens
// the post in the composer through the calendar's own edit action
export const ApprovalsButton: FC<{ openPost: (post: any) => void }> = ({ openPost }) => {
  const modals = useModals();
  const { data: setting } = useApprovalSetting();
  const { data } = useApprovalList(!!setting);
  const items = data?.items || [];
  const pending = items.filter((i) => i.status === 'PENDING').length;

  if (!setting || (!setting.required && !items.length)) {
    return null;
  }

  const open = () => {
    modals.openModal({
      title: 'Awaiting approval',
      withCloseButton: true,
      children: (close) => (
        <ApprovalList
          items={items}
          onOpen={(item) => {
            close();
            openPost(item.post);
          }}
        />
      ),
    });
  };

  return (
    <button
      type="button"
      onClick={open}
      className={clsx(
        'h-[42px] px-[14px] rounded-[8px] border text-[14px] font-[500] whitespace-nowrap',
        pending ? 'border-[#a97a45] text-[#a97a45]' : 'border-newTableBorder'
      )}
    >
      {setting.canApprove ? 'Awaiting approval' : 'My submissions'}
      {!!items.length && ` (${setting.canApprove ? pending : items.length})`}
    </button>
  );
};
