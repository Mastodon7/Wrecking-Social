import Link from 'next/link';
import { Metadata } from 'next';
import { COMPANY_EMAIL } from '@gitroom/frontend/components/website/website.company';

export const metadata: Metadata = {
  title: {
    absolute: 'Wrecking Social: Schedule It. Create It. Crush It.',
  },
  alternates: { canonical: '/' },
};

// Only platforms Wrecking Social has apps for. Add one here once its app is
// approved and set up: reviewers treat listing unavailable platforms as
// misleading, and Reddit needs written approval before it is advertised.
// LinkedIn covers both profiles and Company Pages
const platforms = [
  { name: 'Facebook', icon: 'facebook' },
  { name: 'Instagram', icon: 'instagram' },
  { name: 'Threads', icon: 'threads' },
  { name: 'LinkedIn', icon: 'linkedin' },
  { name: 'TikTok', icon: 'tiktok' },
  { name: 'YouTube', icon: 'youtube' },
  { name: 'Pinterest', icon: 'pinterest' },
  { name: 'Google Business Profile', icon: 'gmb' },
  { name: 'Bluesky', icon: 'bluesky' },
  { name: 'Mastodon', icon: 'mastodon' },
];

const PlatformChip = ({ name, icon }: { name: string; icon: string }) => (
  <li className="flex items-center gap-[10px] shrink-0 ps-[8px] pe-[16px] py-[8px] rounded-full bg-ws-inkSoft border border-ws-line">
    <img
      src={`/icons/platforms/${icon}.png`}
      alt=""
      width={32}
      height={32}
      className="w-[32px] h-[32px] rounded-full"
    />
    <span className="text-[16px] font-[600] text-white whitespace-nowrap">
      {name}
    </span>
  </li>
);

const features = [
  {
    title: 'One calendar for every channel',
    text: 'See everything you have planned across all your social accounts in a single day, week or month view. Drag a post to move it.',
  },
  {
    title: 'Write once, adjust per platform',
    text: 'Start from one draft, then tailor the caption, media and settings for each network before it goes out.',
  },
  {
    title: 'Preview before you publish',
    text: 'See how a post will look on each platform, so there are no surprises when it goes live.',
  },
  {
    title: 'Scheduled publishing',
    text: 'Pick a date and time and the post is published for you, with automatic retries if a platform is briefly unavailable.',
  },
  {
    title: 'Media library',
    text: 'Upload images and videos once and reuse them across posts and channels.',
  },
  {
    title: 'Teams and approvals',
    text: 'Invite teammates, share drafts, leave comments and decide who can publish.',
  },
  {
    title: 'Analytics',
    text: 'Check how your posts and channels perform, using the statistics each platform provides for your own accounts.',
  },
  {
    title: 'AI writing help',
    text: 'Get help drafting captions and ideas when you want it. You always review and edit before anything is posted.',
  },
];

const steps = [
  {
    title: 'Create your account',
    text: 'Sign up with your email and set up a workspace for your brand or business.',
  },
  {
    title: 'Connect your channels',
    text: 'Click "Add Channel" and sign in on the official page of each platform (for example Facebook, TikTok or Google). You see exactly what you are allowing before you approve it.',
  },
  {
    title: 'Create and schedule',
    text: 'Write your post, add images or video, choose the channels and settings, and pick when it goes out.',
  },
  {
    title: 'Publish and review',
    text: 'The post is published at the time you chose, to the accounts you chose. Then check the results in analytics.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute -top-[220px] -start-[200px] w-[700px] h-[500px] rounded-full bg-ws-greenDeep blur-[140px] opacity-40" />
        <div className="relative max-w-[1200px] mx-auto px-[16px] pt-[48px] md:pt-[72px] pb-[56px] grid gap-[40px] md:grid-cols-[1.15fr_1fr] items-center">
          <div className="flex flex-col gap-[24px]">
            <p className="text-[15px] md:text-[16px] font-[600] text-ws-muted">
              Social media publishing · For businesses, creators and agencies
            </p>
            <h1 className="ws-headline text-[44px] sm:text-[56px] lg:text-[72px] text-white">
              Plan, create and publish
              <span className="block text-ws-green">
                your social media from one place.
              </span>
            </h1>
            <p className="text-[18px] md:text-[20px] leading-[1.6] text-ws-text max-w-[560px]">
              Wrecking Social lets you connect your accounts, build your posts,
              schedule them on a shared calendar and let them go out on time,
              on every channel.
            </p>
            <div className="flex flex-wrap items-center gap-[20px]">
              <Link
                href="/auth"
                className="text-[17px] font-[700] bg-ws-green text-ws-ink px-[26px] py-[15px] rounded-[10px] hover:bg-ws-greenHover"
              >
                Get started →
              </Link>
              <Link
                href="/#how-it-works"
                className="text-[17px] font-[700] text-white hover:text-ws-green"
              >
                See how it works ↓
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[460px] md:max-w-none">
            <svg
              aria-hidden="true"
              viewBox="0 0 500 600"
              className="absolute -start-[22%] -top-[4%] w-[144%] h-auto"
              fill="none"
            >
              <path
                d="M-10 560 C 90 600, 120 380, 230 330 S 430 330, 510 40"
                stroke="var(--ws-green)"
                strokeWidth="46"
                strokeLinecap="round"
                opacity="0.9"
              />
            </svg>
            <img
              src="/website/hero-person.jpg"
              alt="A smiling woman working on a laptop"
              width={1000}
              height={1457}
              fetchPriority="high"
              className="relative w-full h-[440px] md:h-[560px] object-cover object-[50%_30%] rounded-[28px] border border-ws-line shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
            />
            <div
              aria-hidden="true"
              className="absolute top-[28px] -start-[12px] md:-start-[44px] flex items-center gap-[10px] bg-white text-ws-ink rounded-[14px] px-[14px] py-[10px] shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
            >
              <span className="w-[34px] h-[34px] rounded-full bg-[#ffe1e6] text-[#e8284f] flex items-center justify-center text-[18px]">
                ♥
              </span>
              <span className="flex flex-col leading-[1.15]">
                <strong className="ws-headline text-[20px]">+2.4k</strong>
                <span className="text-[13px] text-[#4a5a4e]">likes this week</span>
              </span>
            </div>
            <div
              aria-hidden="true"
              className="absolute bottom-[96px] -end-[8px] md:-end-[28px] bg-white text-ws-ink rounded-[14px] px-[14px] py-[12px] shadow-[0_12px_30px_rgba(0,0,0,0.35)] w-[190px]"
            >
              <span className="text-[13px] text-[#4a5a4e]">Reach</span>
              <div className="flex items-end justify-between">
                <strong className="ws-headline text-[22px]">18.6k</strong>
                <span className="text-[13px] font-[700] text-ws-greenDeep">▲ 38%</span>
              </div>
              <div className="mt-[8px] flex items-end gap-[5px] h-[34px]">
                {[40, 55, 35, 65, 50, 80, 100].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className="flex-1 rounded-[3px] bg-ws-green"
                  />
                ))}
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute -bottom-[18px] start-[24px] flex items-center gap-[10px] bg-ws-green text-ws-ink rounded-[14px] px-[16px] py-[11px] shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-[20px] h-[20px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <rect x="3" y="5" width="18" height="16" rx="3" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
              <span className="text-[15px] font-[700]">12 posts scheduled</span>
            </div>
          </div>
        </div>
      </section>

      <section id="platforms" className="border-y border-ws-line bg-ws-deep">
        <div className="max-w-[1200px] mx-auto px-[16px] py-[36px] flex flex-col md:flex-row md:items-center gap-[20px] md:gap-[32px]">
          <h2 className="ws-headline text-[30px] md:text-[34px] text-white shrink-0 md:w-[200px]">
            Post <span className="text-ws-green">Everywhere!</span>
          </h2>
          <div className="ws-marquee flex-1 min-w-0">
            <div className="ws-marquee-track">
              <ul className="flex gap-[14px] pe-[14px]" aria-label="Platforms you can publish to">
                {platforms.map((p) => (
                  <PlatformChip key={p.icon} {...p} />
                ))}
              </ul>
              <ul className="flex gap-[14px] pe-[14px]" aria-hidden="true">
                {platforms.map((p) => (
                  <PlatformChip key={p.icon} {...p} />
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="max-w-[1200px] mx-auto px-[16px] pb-[20px] text-center md:text-start text-[13px] text-ws-muted">
          Platform names and logos are trademarks of their owners. Wrecking
          Social is not affiliated with or endorsed by them.
        </p>
      </section>

      <section id="features" className="max-w-[1200px] mx-auto px-[16px] py-[72px]">
        <h2 className="ws-display text-[30px] md:text-[40px] font-[800] text-white mb-[12px]">
          Everything you need to run your social channels
        </h2>
        <p className="text-[18px] text-ws-text mb-[40px] max-w-[760px]">
          Schedule It. Create It. Crush It. Wrecking Social takes the busywork
          out of posting so you can spend your time on the ideas.
        </p>
        <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-[14px] border border-ws-line bg-ws-inkSoft p-[20px] flex flex-col gap-[8px]"
            >
              <h3 className="ws-display text-[19px] font-[700] text-white">
                {f.title}
              </h3>
              <p className="text-[15px] leading-[1.6] text-ws-textSoft">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-ws-deep border-y border-ws-line">
        <div className="max-w-[1200px] mx-auto px-[16px] py-[72px]">
          <h2 className="ws-display text-[30px] md:text-[40px] font-[800] text-white mb-[40px]">
            How it works
          </h2>
          <ol className="grid gap-[16px] md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-[10px]">
                <div className="ws-display w-[44px] h-[44px] rounded-full bg-ws-green text-ws-ink text-[20px] font-[800] flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="ws-display text-[19px] font-[700] text-white">
                  {s.title}
                </h3>
                <p className="text-[15px] leading-[1.6] text-ws-textSoft">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="your-data" className="max-w-[1200px] mx-auto px-[16px] py-[72px] grid gap-[32px] md:grid-cols-2">
        <div>
          <h2 className="ws-display text-[30px] md:text-[40px] font-[800] text-white mb-[16px]">
            Your accounts stay in your control
          </h2>
          <p className="text-[17px] text-ws-text leading-[1.7]">
            When you connect a channel, the platform asks you to approve access
            on its own sign-in page. Wrecking Social only uses that access to do
            what you ask in the app.
          </p>
        </div>
        <ul className="flex flex-col gap-[14px] text-[16px] text-ws-text leading-[1.6]">
          <li>
            <strong className="text-white">You decide what is posted.</strong>{' '}
            We publish only the posts you or your teammates create and
            schedule, to the channels you pick.
          </li>
          <li>
            <strong className="text-white">We only read what the features need.</strong>{' '}
            For example your profile name and picture, the pages or channels
            you manage, and the statistics of your own posts.
          </li>
          <li>
            <strong className="text-white">We never sell your data</strong>{' '}
            and we do not use it for advertising.
          </li>
          <li>
            <strong className="text-white">Disconnect any time.</strong>{' '}
            Delete a channel or your whole account from inside the app, or
            follow our{' '}
            <Link href="/data-deletion" className="text-ws-green underline">
              data deletion instructions
            </Link>
            . Read the full{' '}
            <Link href="/privacy" className="text-ws-green underline">
              Privacy Policy
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="max-w-[1200px] mx-auto px-[16px] pb-[80px]">
        <div className="rounded-[20px] bg-gradient-to-br from-ws-greenDeep to-ws-inkSoft border border-ws-green/30 px-[24px] py-[48px] text-center flex flex-col items-center gap-[18px]">
          <h2 className="ws-display text-[28px] md:text-[38px] font-[800] text-white">
            Ready to take over your feed?
          </h2>
          <p className="text-[17px] text-ws-light max-w-[640px]">
            Create your workspace and connect your first channel in a few
            minutes. Questions first? Email us at{' '}
            <a href={`mailto:${COMPANY_EMAIL}`} className="underline">
              {COMPANY_EMAIL}
            </a>
            .
          </p>
          <Link
            href="/auth"
            className="text-[16px] font-[700] bg-ws-green text-ws-ink px-[22px] py-[13px] rounded-[10px] hover:bg-ws-greenHover"
          >
            Get started
          </Link>
        </div>
      </section>
    </>
  );
}
