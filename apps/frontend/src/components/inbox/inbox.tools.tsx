'use client';

import useSWR from 'swr';
import { FC, useCallback, useEffect, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';

export type CommentState = {
  integrationId: string;
  commentId: string;
  done: boolean;
  assignedToId: string | null;
};
export type TeamMember = { id: string; name: string };
export type SavedReply = { id: string; title: string; content: string };

const options = { revalidateOnFocus: false, revalidateOnReconnect: false };

export const stateKey = (integrationId: string, commentId: string) =>
  `${integrationId}_${commentId}`;

export const useInboxStates = () => {
  const fetch = useFetch();
  const load = useCallback(
    async () => (await fetch('/inbox-tools/state')).json(),
    []
  );
  return useSWR<CommentState[]>('inbox-states', load, options);
};

export const useInboxTeam = () => {
  const fetch = useFetch();
  const load = useCallback(
    async () => (await fetch('/inbox-tools/team')).json(),
    []
  );
  return useSWR<TeamMember[]>('inbox-team', load, options);
};

export const useSavedReplies = () => {
  const fetch = useFetch();
  const load = useCallback(
    async () => (await fetch('/inbox-tools/replies')).json(),
    []
  );
  return useSWR<SavedReply[]>('inbox-saved-replies', load, options);
};

export const useInboxKnowledge = () => {
  const fetch = useFetch();
  const load = useCallback(
    async () => (await fetch('/inbox-tools/knowledge')).json(),
    []
  );
  return useSWR<{ knowledge: string; aiConfigured: boolean }>(
    'inbox-knowledge',
    load,
    options
  );
};

const input =
  'bg-input w-full px-[12px] outline-none border-fifth border rounded-[4px] text-inputText placeholder-inputText text-[14px]';
const smallButton =
  'h-[32px] px-[12px] rounded-[6px] border border-newTextColor/10 text-[13px] shrink-0';

// "Reply settings": saved replies, and the business facts AI drafts may use
export const ReplySettings: FC = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const { data: replies, mutate: mutateReplies } = useSavedReplies();
  const { data: knowledgeData, mutate: mutateKnowledge } = useInboxKnowledge();
  const [knowledge, setKnowledge] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    id?: string;
    title: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    if (knowledgeData && knowledge === null) {
      setKnowledge(knowledgeData.knowledge);
    }
  }, [knowledgeData]);

  const saveKnowledge = async () => {
    const res = await fetch('/inbox-tools/knowledge', {
      method: 'POST',
      body: JSON.stringify({ knowledge: knowledge || '' }),
    });
    if (!res.ok) {
      toaster.show('Could not save. Keep it under 8,000 characters.', 'warning');
      return;
    }
    mutateKnowledge(await res.json());
    toaster.show('Business information saved', 'success');
  };

  const saveReply = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.content.trim()) {
      toaster.show('Give the reply a name and some text.', 'warning');
      return;
    }
    const res = await fetch(
      editing.id ? `/inbox-tools/replies/${editing.id}` : '/inbox-tools/replies',
      {
        method: editing.id ? 'PUT' : 'POST',
        body: JSON.stringify({ title: editing.title, content: editing.content }),
      }
    );
    if (!res.ok) {
      toaster.show('Could not save the reply.', 'warning');
      return;
    }
    setEditing(null);
    mutateReplies();
    toaster.show('Saved reply stored', 'success');
  };

  const removeReply = async (reply: SavedReply) => {
    if (!(await deleteDialog(`Delete the saved reply "${reply.title}"?`))) {
      return;
    }
    await fetch(`/inbox-tools/replies/${reply.id}`, { method: 'DELETE' });
    mutateReplies();
  };

  return (
    <div className="flex flex-col gap-[24px] max-w-[640px]">
      <section className="flex flex-col gap-[10px]">
        <div className="text-[16px] font-[600]">Saved replies</div>
        <div className="text-[13px] text-textItemBlur">
          Answers you give often (turnaround, pricing link, how to order). Pick
          one under any comment to fill in the reply box.
        </div>
        {!replies?.length && !editing && (
          <div className="text-[13px] text-textItemBlur">No saved replies yet.</div>
        )}
        {replies?.map((reply) => (
          <div
            key={reply.id}
            className="flex items-start gap-[10px] border border-newTextColor/10 rounded-[8px] p-[12px]"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-[600]">{reply.title}</div>
              <div className="text-[13px] text-textItemBlur whitespace-pre-wrap break-words">
                {reply.content}
              </div>
            </div>
            <button type="button" className={smallButton} onClick={() => setEditing({ ...reply })}>
              Edit
            </button>
            <button
              type="button"
              className={`${smallButton} border-0 text-[#FF3F3F]`}
              onClick={() => removeReply(reply)}
            >
              Delete
            </button>
          </div>
        ))}
        {editing ? (
          <div className="flex flex-col gap-[8px] border border-newTextColor/10 rounded-[8px] p-[12px]">
            <input
              id="saved-reply-title"
              className={`${input} h-[40px]`}
              placeholder="Name, e.g. Turnaround time"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
            <textarea
              id="saved-reply-content"
              className={`${input} min-h-[90px] py-[8px]`}
              placeholder="Most orders ship in 3–5 business days. Rush options are at checkout."
              value={editing.content}
              maxLength={2000}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
            />
            <div className="flex gap-[8px]">
              <button
                type="button"
                onClick={saveReply}
                className="h-[36px] px-[16px] rounded-[8px] bg-btnPrimary text-white text-[14px] font-[600]"
              >
                Save reply
              </button>
              <button type="button" className={`${smallButton} h-[36px]`} onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              type="button"
              className={`${smallButton} h-[36px] font-[600]`}
              onClick={() => setEditing({ title: '', content: '' })}
            >
              + New saved reply
            </button>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-[10px]">
        <div className="text-[16px] font-[600]">Business information for AI drafts</div>
        <div className="text-[13px] text-textItemBlur">
          The facts &quot;Draft with AI&quot; may use: what you sell, prices or
          where to find them, turnaround, hours, phone, website, how to order.
          The AI won&apos;t invent anything that isn&apos;t here. This text and
          the comment are sent to Anthropic only when you click Draft with AI.
          {knowledgeData && !knowledgeData.aiConfigured && (
            <> The AI assistant is not set up on this server yet.</>
          )}
        </div>
        <textarea
          id="inbox-knowledge"
          className={`${input} min-h-[180px] py-[8px]`}
          maxLength={8000}
          placeholder={'25M Printing, Houston TX. Banners, signs, business cards, stickers.\nPrices: 25mprinting.com\nMost orders ship in 3–5 business days; rush available.\nQuestions: info@… or (xxx) xxx-xxxx'}
          value={knowledge ?? ''}
          onChange={(e) => setKnowledge(e.target.value)}
        />
        <div>
          <button
            type="button"
            onClick={saveKnowledge}
            className="h-[36px] px-[16px] rounded-[8px] bg-btnPrimary text-white text-[14px] font-[600]"
          >
            Save information
          </button>
        </div>
      </section>
    </div>
  );
};
