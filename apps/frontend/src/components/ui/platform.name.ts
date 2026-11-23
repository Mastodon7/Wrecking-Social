// The platform a channel belongs to, as people say it. Channels are named
// after the account (often the same handle on several platforms), so lists
// show this next to the name.
const NAMES: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  'instagram-standalone': 'Instagram',
  threads: 'Threads',
  linkedin: 'LinkedIn',
  'linkedin-page': 'LinkedIn Page',
  tiktok: 'TikTok',
  'tiktok-business': 'TikTok Business',
  youtube: 'YouTube',
  gmb: 'Google Business',
  pinterest: 'Pinterest',
  bluesky: 'Bluesky',
  x: 'X',
  mastodon: 'Mastodon',
  'mastodon-custom': 'Mastodon',
  reddit: 'Reddit',
  discord: 'Discord',
  slack: 'Slack',
  telegram: 'Telegram',
  tumblr: 'Tumblr',
  twitch: 'Twitch',
  kick: 'Kick',
  lemmy: 'Lemmy',
  wrapcast: 'Farcaster',
  nostr: 'Nostr',
  vk: 'VK',
  medium: 'Medium',
  devto: 'Dev.to',
  hashnode: 'Hashnode',
  wordpress: 'WordPress',
  listmonk: 'Listmonk',
  dribbble: 'Dribbble',
  skool: 'Skool',
  whop: 'Whop',
  mewe: 'MeWe',
  moltbook: 'Moltbook',
};

export const platformName = (identifier?: string) => {
  if (!identifier) return '';
  if (NAMES[identifier]) return NAMES[identifier];
  const base = identifier.split('-')[0];
  return NAMES[base] || base.charAt(0).toUpperCase() + base.slice(1);
};
