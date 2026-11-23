'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';

type Slide = { heading: string; body: string };
const W = 1080;
const H = 1350;
const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';

const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
  }
  return lines;
};

// Shrinks the font until the text fits in maxLines
const fit = (ctx: CanvasRenderingContext2D, text: string, size: number, weight: number, maxWidth: number, maxLines: number) => {
  let s = size;
  let lines: string[] = [];
  while (s > 24) {
    ctx.font = `${weight} ${s}px ${FONT}`;
    lines = wrap(ctx, text, maxWidth);
    if (lines.length <= maxLines) break;
    s -= 4;
  }
  return { size: s, lines };
};

const readable = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#16181d' : '#ffffff';
};

// One slide as a 1080x1350 image (Instagram portrait, also fine on LinkedIn)
export const drawSlide = (
  canvas: HTMLCanvasElement,
  slide: Slide,
  index: number,
  total: number,
  accent: string,
  brand: string
) => {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const edge = index === 0 || index === total - 1;
  const bg = edge ? accent : '#f7f7f5';
  const fg = edge ? readable(accent) : '#16181d';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const pad = 96;
  const width = W - pad * 2;

  if (!edge) {
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, W, 18);
    ctx.font = `700 44px ${FONT}`;
    ctx.fillText(String(index).padStart(2, '0'), pad, 170);
  }

  const heading = fit(ctx, slide.heading, index === 0 ? 108 : 92, 800, width, index === 0 ? 5 : 4);
  const body = fit(ctx, slide.body, edge ? 48 : 54, 400, width, 9);
  const headingHeight = heading.lines.length * heading.size * 1.12;
  const bodyHeight = body.lines.length * body.size * 1.4;
  // the text block sits in the middle; inner slides keep clear of the number
  let y = Math.max(edge ? 160 : 260, (H - headingHeight - bodyHeight - 50) / 2 + heading.size);

  ctx.fillStyle = fg;
  ctx.font = `800 ${heading.size}px ${FONT}`;
  for (const line of heading.lines) {
    ctx.fillText(line, pad, y);
    y += heading.size * 1.12;
  }
  y += 50;
  ctx.globalAlpha = 0.85;
  ctx.font = `400 ${body.size}px ${FONT}`;
  for (const line of body.lines) {
    ctx.fillText(line, pad, y);
    y += body.size * 1.4;
  }
  ctx.globalAlpha = 1;

  ctx.font = `600 32px ${FONT}`;
  ctx.fillStyle = edge ? fg : '#5c626d';
  if (brand) ctx.fillText(brand, pad, H - 80);
  const right = index === 0 ? 'Swipe →' : `${index + 1}/${total}`;
  ctx.fillText(right, W - pad - ctx.measureText(right).width, H - 80);
};

const SlidePreview: FC<{ slide: Slide; index: number; total: number; accent: string; brand: string }> = (props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) drawSlide(ref.current, props.slide, props.index, props.total, props.accent, props.brand);
  }, [props.slide, props.index, props.total, props.accent, props.brand]);
  return <canvas ref={ref} className="w-[180px] h-[225px] rounded-[8px] border border-newTextColor/10 shrink-0" />;
};

const CarouselModal: FC<{
  initial: string;
  onAdd: (media: { id: string; path: string }[]) => void;
  close: () => void;
}> = ({ initial, onAdd, close }) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const [topic, setTopic] = useState(initial);
  const [count, setCount] = useState(6);
  const [accent, setAccent] = useState(() => {
    try {
      return localStorage.getItem('carousel-accent') || '#086b31';
    } catch {
      return '#086b31';
    }
  });
  const [brand, setBrand] = useState(() => {
    try {
      return localStorage.getItem('carousel-brand') || '';
    } catch {
      return '';
    }
  });
  const [slides, setSlides] = useState<Slide[]>([]);
  const [caption, setCaption] = useState('');
  const [writing, setWriting] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('carousel-accent', accent);
      localStorage.setItem('carousel-brand', brand);
    } catch {
      // per-browser convenience only
    }
  }, [accent, brand]);

  const write = async () => {
    setWriting(true);
    const res = await fetch('/carousel/write', { method: 'POST', body: JSON.stringify({ topic, slides: count }) });
    setWriting(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return toaster.show(body?.message || 'Could not write the carousel', 'warning');
    setSlides(body.slides);
    setCaption(body.caption);
  };

  const add = async () => {
    setAdding(true);
    try {
      const uploaded: { id: string; path: string }[] = [];
      for (const [i, slide] of slides.entries()) {
        const canvas = document.createElement('canvas');
        drawSlide(canvas, slide, i, slides.length, accent, brand);
        const blob: Blob = await new Promise((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('render'))), 'image/png')
        );
        const form = new FormData();
        form.append('file', new File([blob], `carousel-${Date.now()}-${i + 1}.png`, { type: 'image/png' }));
        const res = await fetch('/media/upload-server', { method: 'POST', body: form });
        if (!res.ok) throw new Error('upload');
        const media = await res.json();
        uploaded.push({ id: media.id, path: media.path });
      }
      onAdd(uploaded);
      toaster.show(`${uploaded.length} slides added to the post`, 'success');
      close();
    } catch {
      toaster.show('Could not add the slides. Try again.', 'warning');
    } finally {
      setAdding(false);
    }
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toaster.show('Caption copied', 'success');
    } catch {
      toaster.show('Select the caption and copy it', 'warning');
    }
  };

  const input =
    'bg-input w-full px-[12px] outline-none border-fifth border rounded-[4px] text-inputText placeholder-inputText text-[14px]';

  return (
    <div className="flex flex-col gap-[12px] w-[760px] max-w-full">
      <textarea
        id="carousel-topic"
        className={`${input} min-h-[80px] py-[8px]`}
        placeholder="What is the carousel about? e.g. 5 things to check before ordering a vinyl banner"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        maxLength={6000}
      />
      <div className="flex flex-wrap items-center gap-[12px] text-[13px]">
        <label className="flex items-center gap-[6px]">
          Slides
          <select value={count} onChange={(e) => setCount(+e.target.value)} className="bg-input border-fifth border rounded-[4px] h-[32px] px-[6px]">
            {[4, 5, 6, 7, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-[6px]">
          Color
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
        </label>
        <input
          id="carousel-brand"
          className={`${input} h-[32px] w-[200px]`}
          placeholder="Brand name on slides"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          maxLength={40}
        />
        <Button onClick={write} loading={writing} disabled={topic.trim().length < 5}>
          ✦ {slides.length ? 'Write again' : 'Write the slides'}
        </Button>
      </div>

      {!!slides.length && (
        <>
          <div className="flex gap-[10px] overflow-x-auto pb-[6px]">
            {slides.map((s, i) => (
              <SlidePreview key={i} slide={s} index={i} total={slides.length} accent={accent} brand={brand} />
            ))}
          </div>
          <div className="flex flex-col gap-[8px] max-h-[260px] overflow-auto pe-[4px]">
            {slides.map((s, i) => (
              <div key={i} className="flex gap-[8px] items-start">
                <span className="text-[12px] text-textItemBlur w-[20px] pt-[10px]">{i + 1}</span>
                <input
                  className={`${input} h-[38px] w-[38%]`}
                  value={s.heading}
                  onChange={(e) => setSlides((l) => l.map((x, j) => (j === i ? { ...x, heading: e.target.value } : x)))}
                />
                <textarea
                  className={`${input} min-h-[38px] py-[8px]`}
                  value={s.body}
                  onChange={(e) => setSlides((l) => l.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-[6px]">
            <div className="text-[13px] flex items-center gap-[10px]">
              Caption
              <button type="button" className="underline text-textItemBlur" onClick={copyCaption}>
                Copy
              </button>
            </div>
            <textarea className={`${input} min-h-[70px] py-[8px]`} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <div className={clsx('flex gap-[8px]')}>
            <Button onClick={add} loading={adding}>
              Add {slides.length} slides to the post
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// The "Carousel" button next to the AI image button under the editor
export const AiCarousel: FC<{
  value: string;
  onChange: (media: { id: string; path: string }[]) => void;
}> = ({ value, onChange }) => {
  const modals = useModals();
  const open = useCallback(() => {
    modals.openModal({
      title: 'AI carousel',
      withCloseButton: true,
      children: (close) => (
        <CarouselModal
          initial={stripHtmlValidation('none', value || '', false).trim()}
          onAdd={onChange}
          close={close}
        />
      ),
    });
  }, [value, onChange]);

  return (
    <div
      onClick={open}
      className="cursor-pointer h-[30px] mobile:h-[40px] mobile:min-w-[40px] rounded-[6px] mobile:rounded-[8px] justify-center items-center flex bg-newColColor mobile:bg-newSettings px-[8px]"
    >
      <div className="flex gap-[5px] items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" className="mobile:w-[20px] mobile:h-[20px]">
          <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 7v10M21 7v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <div className="text-[10px] font-[600] iconBreak:hidden block">Carousel</div>
      </div>
    </div>
  );
};
