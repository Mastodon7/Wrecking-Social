import { FC, useCallback, useState } from 'react';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';
import { useBrandVoices } from '@gitroom/frontend/components/settings/brand-voice.component';

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// plain text with line breaks, as the editor's paragraphs
const toHtml = (text: string) =>
  text
    .split(/\n/)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');

const BrandVoiceModal: FC<{
  initial: string;
  integrationId: string;
  platform: string;
  onUse: (text: string) => void;
}> = ({ initial, integrationId, platform, onUse }) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const { data } = useBrandVoices();
  const [mode, setMode] = useState<'rewrite' | 'idea'>(initial.trim() ? 'rewrite' : 'idea');
  const [text, setText] = useState(initial);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const hasVoice = !!data?.voices?.some(
    (v) => v.integrationId === '' || v.integrationId === integrationId
  );

  const generate = async () => {
    setLoading(true);
    const res = await fetch('/brand-voice/write', {
      method: 'POST',
      body: JSON.stringify({ mode, text, integrationId, platform }),
    });
    setLoading(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      toaster.show(body?.message || 'Could not write the post', 'warning');
      return;
    }
    setResult(body.text);
  };

  if (data && (!data.aiConfigured || !hasVoice)) {
    return (
      <div className="flex flex-col gap-[10px] max-w-[560px] text-[14px]">
        {!data.aiConfigured
          ? 'The AI assistant is not set up on this server yet.'
          : 'No brand voice yet. Go to Settings → Brand voice and click "Learn from past posts" (or write one), then come back.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[12px] w-[560px] max-w-full">
      <div className="flex gap-[16px] text-[14px]">
        <label className="flex items-center gap-[6px] cursor-pointer">
          <input
            type="radio"
            name="bv-mode"
            checked={mode === 'rewrite'}
            onChange={() => setMode('rewrite')}
          />
          Rewrite my draft
        </label>
        <label className="flex items-center gap-[6px] cursor-pointer">
          <input
            type="radio"
            name="bv-mode"
            checked={mode === 'idea'}
            onChange={() => setMode('idea')}
          />
          Write from an idea
        </label>
      </div>
      <textarea
        id="bv-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={8000}
        placeholder={
          mode === 'rewrite'
            ? 'Your draft'
            : 'e.g. New 3x6 vinyl banners, same-day pickup this week, link to the banner page'
        }
        className="bg-input min-h-[120px] p-[12px] outline-none border-fifth border rounded-[4px] text-inputText placeholder-inputText text-[14px]"
      />
      <div>
        <Button onClick={generate} loading={loading} disabled={!text.trim()}>
          ✦ {mode === 'rewrite' ? 'Rewrite in brand voice' : 'Write the post'}
        </Button>
      </div>
      {!!result && (
        <div className="flex flex-col gap-[8px]">
          <div className="text-[13px] text-textItemBlur">Result (you can edit it):</div>
          <textarea
            id="bv-result"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="bg-input min-h-[160px] p-[12px] outline-none border-fifth border rounded-[4px] text-inputText text-[14px]"
          />
          <div className="flex gap-[8px]">
            <Button onClick={() => onUse(result)}>Use this</Button>
            <Button onClick={generate} loading={loading} secondary={true}>
              Try again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// The ✦ button in the editor toolbar
export const BrandVoiceBox: FC<{
  editor: any;
  value: string;
  integrationId: string;
  platform: string;
  onChange: (value: string) => void;
}> = ({ editor, value, integrationId, platform, onChange }) => {
  const modals = useModals();
  const open = useCallback(() => {
    const initial = stripHtmlValidation('none', value || '', false).trim();
    modals.openModal({
      title: 'Brand voice',
      withCloseButton: true,
      children: (close) => (
        <BrandVoiceModal
          initial={initial}
          integrationId={integrationId}
          platform={platform}
          onUse={(text) => {
            const html = toHtml(text);
            if (editor?.commands?.setContent) {
              editor.commands.setContent(html);
            }
            onChange(html);
            close();
          }}
        />
      ),
    });
  }, [editor, value, integrationId, platform, onChange]);

  return (
    <div
      onClick={open}
      data-tooltip-id="tooltip"
      data-tooltip-content="Write in your brand voice"
      className="select-none cursor-pointer rounded-[6px] mobile:rounded-[8px] w-[30px] h-[30px] mobile:w-[40px] mobile:h-[40px] bg-newColColor mobile:bg-newSettings flex justify-center items-center text-[15px]"
    >
      ✦
    </div>
  );
};
