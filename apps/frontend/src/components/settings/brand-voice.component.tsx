'use client';

import React, { FC, useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';

export type BrandVoice = {
  integrationId: string;
  profile: string;
  learnedFrom: number;
  updatedAt: string;
};
type Channel = { id: string; name: string; identifier: string; disabled?: boolean };

export const useBrandVoices = () => {
  const fetch = useFetch();
  const load = useCallback(async () => (await fetch('/brand-voice')).json(), []);
  return useSWR<{ voices: BrandVoice[]; aiConfigured: boolean }>('brand-voices', load, {
    revalidateOnFocus: false,
  });
};

const useChannels = () => {
  const fetch = useFetch();
  const load = useCallback(
    async () => (await (await fetch('/integrations/list')).json()).integrations,
    []
  );
  return useSWR<Channel[]>('brand-voice-channels', load, { revalidateOnFocus: false });
};

const input =
  'w-full px-[12px] rounded-[6px] bg-newBgColorInner border border-newTextColor/10 text-[14px] outline-none focus:border-btnPrimary';

const VoiceRow: FC<{
  id: string;
  label: string;
  hint: string;
  voice?: BrandVoice;
  aiConfigured: boolean;
  onSaved: () => void;
}> = ({ id, label, hint, voice, aiConfigured, onSaved }) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(voice?.profile || '');
  const [notes, setNotes] = useState('');
  const [learning, setLearning] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => setProfile(voice?.profile || ''), [voice?.profile]);

  const learn = async () => {
    setLearning(true);
    const res = await fetch(`/brand-voice/${id}/learn`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    setLearning(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      toaster.show(body?.message || 'Could not learn the voice', 'warning');
      return;
    }
    setProfile(body.profile);
    setOpen(true);
    onSaved();
    toaster.show(`Learned from ${body.learnedFrom} posts. Review it and edit anything that's off.`, 'success');
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/brand-voice/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ profile }),
    });
    setSaving(false);
    if (!res.ok) {
      toaster.show('Could not save the voice', 'warning');
      return;
    }
    onSaved();
    toaster.show(profile.trim() ? 'Brand voice saved' : 'Brand voice removed', 'success');
  };

  return (
    <div className="border border-newTextColor/10 rounded-[8px] p-[14px] flex flex-col gap-[10px]">
      <div className="flex items-center gap-[12px] flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <div className="text-[14px] font-[600]">{label}</div>
          <div className="text-[12px] text-customColor18">
            {voice
              ? voice.learnedFrom
                ? `Learned from ${voice.learnedFrom} posts · updated ${new Date(voice.updatedAt).toLocaleDateString()}`
                : `Written by hand · updated ${new Date(voice.updatedAt).toLocaleDateString()}`
              : hint}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="h-[34px] px-[12px] rounded-[6px] border border-newTextColor/10 text-[13px]"
        >
          {open ? 'Close' : voice ? 'View / edit' : 'Set up'}
        </button>
      </div>
      {open && (
        <div className="flex flex-col gap-[10px]">
          <textarea
            id={`voice-notes-${id}`}
            className={`${input} min-h-[60px] py-[8px]`}
            maxLength={2000}
            placeholder="Optional notes for the AI, e.g. Family-owned print shop in Houston. Friendly, a little funny, never pushy. We say 'y'all'."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {aiConfigured && (
            <div>
              <Button onClick={learn} loading={learning} secondary={true}>
                ✦ Learn from past posts
              </Button>
            </div>
          )}
          <textarea
            id={`voice-profile-${id}`}
            className={`${input} min-h-[220px] py-[8px]`}
            maxLength={6000}
            placeholder="The brand voice guide the AI follows. Learn it from past posts, or write it yourself."
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
          />
          <div className="flex gap-[8px]">
            <Button onClick={save} loading={saving}>
              Save voice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const BrandVoiceComponent = () => {
  const { data, mutate } = useBrandVoices();
  const { data: channels } = useChannels();
  const voices = data?.voices || [];
  const find = (id: string) => voices.find((v) => v.integrationId === id);

  return (
    <div className="my-[16px] mt-[16px] bg-sixth border-fifth border rounded-[4px] p-[24px] flex flex-col gap-[14px]">
      <div>Brand voice</div>
      <div className="text-[12px] text-customColor18">
        Teach the AI how your brand writes. It reads your recent posts and
        writes a short style guide you can edit. In the post editor, the ✦
        button then rewrites a draft or writes a post from an idea in that
        voice. The default voice is used for any channel without its own.
        {data && !data.aiConfigured && ' The AI assistant is not set up on this server yet, so voices can only be written by hand.'}
      </div>
      <VoiceRow
        id="default"
        label="Default voice (all channels)"
        hint="Learns from posts on every channel"
        voice={find('')}
        aiConfigured={!!data?.aiConfigured}
        onSaved={() => mutate()}
      />
      {(channels || [])
        .filter((c) => !c.disabled)
        .map((channel) => (
          <VoiceRow
            key={channel.id}
            id={channel.id}
            label={channel.name}
            hint={`Optional. Its own voice for ${channel.identifier.split('-')[0]}`}
            voice={find(channel.id)}
            aiConfigured={!!data?.aiConfigured}
            onSaved={() => mutate()}
          />
        ))}
    </div>
  );
};

export default BrandVoiceComponent;
