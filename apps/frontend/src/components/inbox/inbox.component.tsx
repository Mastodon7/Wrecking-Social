'use client';

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
      <div className="flex justify-end">
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
  onSent: () => void;
}> = ({ comment, parentName, onSent }) => {
  const [replying, setReplying] = useState(false);

  return (
    <div className="flex gap-[12px] p-[16px] rounded-[8px] bg-newBgColor border border-newTableBorder">
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
        <div className="flex gap-[16px] text-[13px]">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setReplying(!replying)}
          >
            {replying ? 'Cancel' : 'Reply'}
          </button>
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
  const { data, isLoading, mutate } = useInbox();
  const [channel, setChannel] = useState('all');
  const [hideOwn, setHideOwn] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      (data?.comments || []).filter(
        (c) =>
          (channel === 'all' || c.integration.id === channel) &&
          (!hideOwn || !c.own)
      ),
    [data, channel, hideOwn]
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
        <h2 className="flex-1 text-[20px] font-[500]">Inbox</h2>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="bg-input h-[40px] px-[12px] outline-none border-fifth border rounded-[4px] text-inputText"
        >
          <option value="all">All channels</option>
          {channels.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
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
          <div className="text-[20px]">No comments yet</div>
          <div className="text-[14px] text-textItemBlur">
            When people comment on your published posts, their comments show
            up here and you can answer them without leaving Wrecking Social.
          </div>
        </div>
      ) : (
        <div className={clsx('flex flex-col gap-[12px]')}>
          {comments.map((comment) => (
            <CommentRow
              key={`${comment.integration.id}_${comment.id}`}
              comment={comment}
              parentName={comment.parentId ? names[comment.parentId] : undefined}
              onSent={() => mutate()}
            />
          ))}
        </div>
      )}
    </div>
  );
};
