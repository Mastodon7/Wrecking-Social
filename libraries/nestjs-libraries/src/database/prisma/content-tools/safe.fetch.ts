import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

// Addresses a page fetch must never reach: this server, the private
// network, cloud metadata
const blockedV4 = (ip: string) => {
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
};

const blockedV6 = (ip: string) => {
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) {
    return blockedV4(v.slice(7));
  }
  return (
    v === '::' ||
    v === '::1' ||
    v.startsWith('fc') ||
    v.startsWith('fd') ||
    v.startsWith('fe8') ||
    v.startsWith('fe9') ||
    v.startsWith('fea') ||
    v.startsWith('feb') ||
    v.startsWith('ff')
  );
};

const assertPublic = async (url: URL) => {
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only http and https links can be read');
  }
  if (url.port && !['80', '443'].includes(url.port)) {
    throw new Error('That link uses a port that can not be read');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(host)
    ? [{ address: host, family: isIP(host) }]
    : await lookup(host, { all: true });
  if (
    !addresses.length ||
    addresses.some((a) => (a.family === 6 ? blockedV6(a.address) : blockedV4(a.address)))
  ) {
    throw new Error('That link points to a private address');
  }
};

// Fetches a public web page as text, following at most 3 redirects and
// checking every hop. Returns at most maxBytes of the body.
export const safeFetchText = async (raw: string, maxBytes = 2_000_000) => {
  let url = new URL(raw);
  for (let hop = 0; hop < 4; hop++) {
    await assertPublic(url);
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WreckingSocialBot/1.0)',
        Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5',
      },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) break;
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) {
      throw new Error(`The page answered ${response.status}`);
    }
    const type = response.headers.get('content-type') || '';
    if (!/text\/|html|xml|json/.test(type)) {
      throw new Error('That link is not a web page');
    }
    const reader = response.body?.getReader();
    if (!reader) return '';
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      size += value.length;
    }
    await reader.cancel().catch(() => undefined);
    return Buffer.concat(chunks).toString('utf8');
  }
  throw new Error('Too many redirects');
};

// The readable part of an HTML page: title, description and body text
export const pageText = (html: string) => {
  const pick = (re: RegExp) => (html.match(re)?.[1] || '').trim();
  const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const description =
    pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
  const main =
    html.match(/<(article|main)[\s\S]*?<\/\1>/i)?.[0] ||
    html.match(/<body[\s\S]*?<\/body>/i)?.[0] ||
    html;
  const body = main
    .replace(/<(script|style|noscript|svg|nav|footer|header|form|iframe)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
  return [title, description, body].filter(Boolean).join('\n\n').slice(0, 20000);
};
