'use client';

import { platformName } from '@gitroom/frontend/components/ui/platform.name';
import useSWR from 'swr';
import { FC, useCallback, useMemo, useState } from 'react';
import { uniqBy } from 'lodash';
import clsx from 'clsx';
import dayjs from 'dayjs';
import ImageWithFallback from '@gitroom/react/helpers/image.with.fallback';
import { PlatformIcon } from '@gitroom/frontend/components/ui/platform.icon.component';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { Button } from '@gitroom/react/form/button';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import {
  CommentState,
  ReplySettings,
  stateKey,
  TeamMember,
  useInboxKnowledge,
  useInboxStates,
  useInboxTeam,
  useSavedReplies,
} from '@gitroom/frontend/components/inbox/inbox.tools';

// Comments from Google APIs (YouTube) are never sent to an AI provider
const NO_AI = ['youtube', 'gmb'];

interface InboxChannel {
  id: string;
  name: string;
  picture?: string;
  providerIdentifier: string;
}

interface InboxComment {
  id: string;
  parentId?: string;
  replyToId: string;
  text: string;
  createdAt: string;
  author: { name: string; username?: string; picture?: string };
  own?: boolean;
  url?: string;
  integration: InboxChannel;
  post: { id: string; preview: string; url?: string; publishDate: string };
}

interface InboxResponse {
  comments: InboxComment[];
  errors: { integration: string; name: string }[];
}

const useInbox = () => {
  const fetch = useFetch();
  const load = useCallback(async () => {
    return (await (await fetch('/posts/inbox')).json()) as InboxResponse;
  }, []);
  return useSWR<InboxResponse>('inbox', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};

const ReplyBox: FC<{ comment: InboxComment; onSent: () => void }> = ({
  comment,
  onSent,
}) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const { data: savedReplies } = useSavedReplies();
  const { data: knowledge } = useInboxKnowledge();
  const canDraft =
    !!knowledge?.aiConfigured &&
    !NO_AI.includes(comment.integration.providerIdentifier);

  const draft = useCallback(async () => {
    setDrafting(true);
    const response = await fetch('/inbox-tools/draft', {
      method: 'POST',
      body: JSON.stringify({
        integrationId: comment.integration.id,
        commentText: comment.text,
        authorName: comment.author.name,
        postPreview: comment.post.preview,
      }),
    });
    setDrafting(false);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      toaster.show(body?.message || 'Could not draft a reply', 'warning');
      return;
    }
    setMessage(body.reply || '');
    if (body.needsHuman) {
      toaster.show(
        'This one may need a personal answer. Check the draft before sending.',
        'warning'
      );
    }
  }, [comment]);

  const send = useCallback(async () => {
    if (!message.trim()) {
      return;
    }
    setSending(true);
    const response = await fetch(`/posts/${comment.post.id}/inbox/reply`, {
      method: 'POST',
      body: JSON.stringify({
        commentId: comment.replyToId,
        message: message.trim(),
      }),
    });
    setSending(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      toaster.show(body?.message || 'The reply could not be sent', 'warning');
      return;
    }
    toaster.show('Reply sent', 'success');
    setMessage('');
    onSent();
  }, [message, comment]);

  return (
    <div className="flex flex-col gap-[8px]">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`Reply to ${comment.author.name}`}
        maxLength={2000}
        className="bg-input min-h-[90px] p-[12px] outline-none border-fifth border rounded-[4px] text-inputText placeholder-inputText"
      />
      <div className="flex flex-wrap items-center justify-end gap-[8px]">
        {!!savedReplies?.length && (
          <select
            value=""
            onChange={(e) => {
              const reply = savedReplies.find((r) => r.id === e.target.value);
              if (reply) {
                setMessage(reply.content);
              }
            }}
            className="bg-input h-[40px] px-[10px] outline-none border-fifth border rounded-[4px] text-inputText text-[14px]"
          >
            <option value="">Use a saved reply…</option>
            {savedReplies.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        )}
        {canDraft && (
          <Button onClick={draft} loading={drafting} secondary={true}>
            ✦ Draft with AI
          </Button>
        )}
        <Button onClick={send} loading={sending} disabled={!message.trim()}>
          Send reply
        </Button>
      </div>
    </div>
  );
};

const CommentRow: FC<{
  comment: InboxComment;
  parentName?: string;
  state?: CommentState;
  team: TeamMember[];
  onState: (change: { done?: boolean; assignedToId?: string | null }) => void;
  onSent: () => void;
}> = ({ comment, parentName, state, team, onState, onSent }) => {
  const [replying, setReplying] = useState(false);
  const done = !!state?.done;

  return (
    <div
      className={clsx(
        'flex gap-[12px] p-[16px] rounded-[8px] bg-newBgColor border border-newTableBorder',
        done && 'opacity-60'
      )}
    >
      <div className="relative shrink-0 w-[40px] h-[40px]">
        <ImageWithFallback
          fallbackSrc="/no-picture.jpg"
          src={comment.author.picture || '/no-picture.jpg'}
          className="rounded-full w-[40px] h-[40px]"
          alt={comment.author.name}
          width={40}
          height={40}
        />
        <PlatformIcon
          identifier={comment.integration.providerIdentifier}
          size={18}
          className="absolute -bottom-[4px] -end-[4px]"
          iconClassName="rounded-[6px] border border-fifth"
        />
      </div>
      <div className="flex-1 flex flex-col gap-[6px] min-w-0">
        <div className="flex flex-wrap items-center gap-x-[8px] gap-y-[2px] text-[14px]">
          <span className="font-[600]">{comment.author.name}</span>
          {!!comment.author.username &&
            comment.author.username !== comment.author.name && (
              <span className="text-textItemBlur">
                @{comment.author.username}
              </span>
            )}
          {comment.own && (
            <span className="text-[11px] px-[6px] py-[1px] rounded-[4px] bg-btnSimple text-btnText">
              You
            </span>
          )}
          <span className="text-textItemBlur">
            {dayjs(comment.createdAt).format('MMM D, YYYY h:mm A')}
          </span>
          <span className="text-textItemBlur">· {comment.integration.name}</span>
          {done && (
            <span className="text-[11px] px-[6px] py-[1px] rounded-[4px] bg-green-600/20 text-green-500">
              Done
            </span>
          )}
        </div>
        {!!comment.parentId && (
          <div className="text-[12px] text-textItemBlur">
            Replying to {parentName || 'a comment'}
          </div>
        )}
        <div className="whitespace-pre-wrap break-words text-[14px]">
          {comment.text}
        </div>
        <div className="text-[12px] text-textItemBlur truncate">
          On your post:{' '}
          {comment.post.url ? (
            <a
              href={comment.post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-textColor"
            >
              {comment.post.preview || 'View post'}
            </a>
          ) : (
            comment.post.preview
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[6px] text-[13px]">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setReplying(!replying)}
          >
            {replying ? 'Cancel' : 'Reply'}
          </button>
          {!comment.own && (
            <button
              type="button"
              className="text-textItemBlur hover:underline"
              onClick={() => onState({ done: !done })}
            >
              {done ? 'Reopen' : 'Mark done'}
            </button>
          )}
          {!comment.own && team.length > 1 && (
            <select
              aria-label="Assign to"
              value={state?.assignedToId || ''}
              onChange={(e) => onState({ assignedToId: e.target.value || null })}
              className="bg-transparent text-textItemBlur outline-none cursor-pointer"
            >
              <option value="">Unassigned</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  Assigned to {m.name}
                </option>
              ))}
            </select>
          )}
          {!!comment.url && (
            <a
              href={comment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-textItemBlur hover:underline"
            >
              View on platform
            </a>
          )}
        </div>
        {replying && (
          <ReplyBox
            comment={comment}
            onSent={() => {
              setReplying(false);
              // answering a comment handles it
              if (!comment.own) {
                onState({ done: true });
              }
              onSent();
            }}
          />
        )}
      </div>
    </div>
  );
};

export const Inbox = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const modals = useModals();
  const user = useUser();
  const { data, isLoading, mutate } = useInbox();
  const { data: stateList, mutate: mutateStates } = useInboxStates();
  const { data: team } = useInboxTeam();
  const [channel, setChannel] = useState('all');
  const [hideOwn, setHideOwn] = useState(true);
  const [status, setStatus] = useState<'open' | 'done' | 'all'>('open');
  const [assignee, setAssignee] = useState('anyone');
  const [refreshing, setRefreshing] = useState(false);

  const states = useMemo(
    () =>
      Object.fromEntries(
        (stateList || []).map((s) => [stateKey(s.integrationId, s.commentId), s])
      ) as Record<string, CommentState>,
    [stateList]
  );

  const changeState = useCallback(
    async (
      comment: InboxComment,
      change: { done?: boolean; assignedToId?: string | null }
    ) => {
      const key = stateKey(comment.integration.id, comment.id);
      const previous = states[key];
      const next: CommentState = {
        integrationId: comment.integration.id,
        commentId: comment.id,
        done: change.done ?? previous?.done ?? false,
        assignedToId:
          change.assignedToId !== undefined
            ? change.assignedToId
            : previous?.assignedToId ?? null,
      };
      await mutateStates(
        [
          ...(stateList || []).filter(
            (s) => stateKey(s.integrationId, s.commentId) !== key
          ),
          next,
        ],
        { revalidate: false }
      );
      const response = await fetch('/inbox-tools/state', {
        method: 'POST',
        body: JSON.stringify({
          integrationId: comment.integration.id,
          commentId: comment.id,
          ...change,
        }),
      });
      if (!response.ok) {
        toaster.show('Could not save that change', 'warning');
        mutateStates();
      }
    },
    [states, stateList]
  );

  const openSettings = useCallback(() => {
    modals.openModal({
      title: 'Reply settings',
      withCloseButton: true,
      children: () => <ReplySettings />,
    });
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const fresh = (await (
      await fetch('/posts/inbox?refresh=true')
    ).json()) as InboxResponse;
    await mutate(fresh, { revalidate: false });
    setRefreshing(false);
  }, [mutate]);

  const channels = useMemo(
    () =>
      uniqBy(
        (data?.comments || []).map((c) => c.integration),
        (c) => c.id
      ),
    [data]
  );

  const names = useMemo(
    () =>
      Object.fromEntries(
        (data?.comments || []).map((c) => [c.id, c.author.name])
      ),
    [data]
  );

  const comments = useMemo(
    () =>
      (data?.comments || []).filter((c) => {
        const state = states[stateKey(c.integration.id, c.id)];
        const isDone = !!state?.done;
        const owner = state?.assignedToId || null;
        return (
          (channel === 'all' || c.integration.id === channel) &&
          (!hideOwn || !c.own) &&
          (status === 'all' || c.own || (status === 'done') === isDone) &&
          (assignee === 'anyone' ||
            (assignee === 'me' && owner === user?.id) ||
            (assignee === 'unassigned' && !owner) ||
            owner === assignee)
        );
      }),
    [data, channel, hideOwn, status, assignee, states, user?.id]
  );

  const openCount = useMemo(
    () =>
      (data?.comments || []).filter(
        (c) => !c.own && !states[stateKey(c.integration.id, c.id)]?.done
      ).length,
    [data, states]
  );

  if (isLoading) {
    return (
      <div className="bg-newBgColorInner p-[20px] flex flex-1 flex-col gap-[15px] transition-all items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className="bg-newBgColorInner flex-1 flex flex-col p-[20px] mobile:p-[12px] gap-[16px]">
      <div className="flex flex-wrap items-center gap-[12px]">
        <h2 className="flex-1 text-[20px] font-[500]">
          Inbox
          {!!openCount && (
            <span className="ms-[8px] text-[14px] text-textItemBlur">
              {openCount} open
            </span>
          )}
        </h2>
        <select
          aria-label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="bg-input h-[40px] px-[12px] outline-none border-fifth border rounded-[4px] text-inputText"
        >
          <option value="open">Open</option>
          <option value="done">Done</option>
          <option value="all">All</option>
        </select>
        {(team?.length || 0) > 1 && (
          <select
            aria-label="Assigned to"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="bg-input h-[40px] px-[12px] outline-none border-fifth border rounded-[4px] text-inputText"
          >
            <option value="anyone">Anyone</option>
            <option value="me">Assigned to me</option>
            <option value="unassigned">Unassigned</option>
            {team!
              .filter((m) => m.id !== user?.id)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>
        )}
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="bg-input h-[40px] px-[12px] outline-none border-fifth border rounded-[4px] text-inputText"
        >
          <option value="all">All channels</option>
          {channels.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {platformName(c.providerIdentifier)}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-[6px] text-[14px] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideOwn}
            onChange={(e) => setHideOwn(e.target.checked)}
          />
          Hide my replies
        </label>
        <Button onClick={openSettings} secondary={true}>
          Reply settings
        </Button>
        <Button onClick={refresh} loading={refreshing} secondary={true}>
          Refresh
        </Button>
      </div>
      <div className="text-[14px] text-textItemBlur">
        Comments and replies people left on posts you published in the last
        30 days, newest first. Supported: Facebook, Instagram, Threads,
        YouTube, LinkedIn Pages and Bluesky.
      </div>
      {!!data?.errors?.length && (
        <div className="p-[12px] rounded-[8px] border border-red-500/50 bg-red-500/10 text-[14px]">
          Some comments could not be loaded from{' '}
          {data.errors.map((e) => e.name).join(', ')}. The channel may need to
          be reconnected to allow reading comments.
        </div>
      )}
      {!comments.length ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-[8px] py-[60px]">
          <div className="text-[20px]">
            {data?.comments?.length && status === 'open'
              ? 'All caught up'
              : 'No comments here'}
          </div>
          <div className="text-[14px] text-textItemBlur">
            {data?.comments?.length
              ? 'Nothing matches these filters. Switch to All to see every comment.'
              : 'When people comment on your published posts, their comments show up here and you can answer them without leaving Wrecking Social.'}
          </div>
        </div>
      ) : (
        <div className={clsx('flex flex-col gap-[12px]')}>
          {comments.map((comment) => (
            <CommentRow
              key={`${comment.integration.id}_${comment.id}`}
              comment={comment}
              parentName={comment.parentId ? names[comment.parentId] : undefined}
              state={states[stateKey(comment.integration.id, comment.id)]}
              team={team || []}
              onState={(change) => changeState(comment, change)}
              onSent={() => mutate()}
            />
          ))}
        </div>
      )}
    </div>
  );
};
