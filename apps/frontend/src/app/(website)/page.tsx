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
// misleading, and Reddit needs written approval before it is advertised
const platforms = [
  'Facebook Pages',
  'Instagram',
  'Threads',
  'LinkedIn',
  'LinkedIn Pages',
  'TikTok',
  'YouTube',
  'Pinterest',
  'Google Business Profile',
  'Bluesky',
  'Mastodon',
];

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
        <div className="absolute -top-[200px] start-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-ws-greenDeep blur-[140px] opacity-40" />
        <div className="relative max-w-[1200px] mx-auto px-[16px] pt-[64px] pb-[72px] flex flex-col items-center text-center gap-[28px]">
          <img
            src="/wrecking-social-wordmark.png"
            alt="Wrecking Social: Schedule It. Create It. Crush It."
            width={800}
            height={166}
            className="w-full max-w-[640px] h-auto"
          />
          <h1 className="ws-display text-[36px] md:text-[54px] leading-[1.08] font-[800] text-white max-w-[900px]">
            Plan, create and publish your social media from one place.
          </h1>
          <p className="text-[18px] md:text-[20px] text-ws-text max-w-[720px]">
            Wrecking Social is a social media publishing platform for
            businesses, creators and agencies. Connect your accounts, build
            your posts, schedule them on a shared calendar and let them go out
            on time, on every channel.
          </p>
          <div className="flex flex-wrap justify-center gap-[12px]">
            <Link
              href="/auth"
              className="text-[16px] font-[700] bg-ws-green text-ws-ink px-[22px] py-[13px] rounded-[10px] hover:bg-ws-greenHover"
            >
              Get started
            </Link>
            <Link
              href="/#how-it-works"
              className="text-[16px] font-[600] border border-ws-green/50 text-white px-[22px] py-[13px] rounded-[10px] hover:border-ws-green"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <section id="platforms" className="border-y border-ws-line bg-ws-deep">
        <div className="max-w-[1200px] mx-auto px-[16px] py-[48px] flex flex-col gap-[20px]">
          <h2 className="ws-display text-[26px] md:text-[32px] font-[700] text-white text-center">
            Publish to the platforms your audience uses
          </h2>
          <ul className="flex flex-wrap justify-center gap-[10px]">
            {platforms.map((p) => (
              <li
                key={p}
                className="px-[14px] py-[8px] rounded-full border border-ws-line bg-ws-inkSoft text-[15px] text-ws-light"
              >
                {p}
              </li>
            ))}
          </ul>
          <p className="text-center text-[14px] text-ws-muted">
            Platform names are trademarks of their owners. Wrecking Social is
            not affiliated with or endorsed by them.
          </p>
        </div>
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
