import './website.scss';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import clsx from 'clsx';
import {
  bricolageGrotesque,
  dmSans,
} from '@gitroom/frontend/fonts/wrecking-social/wrecking.social.font';
import { WebsiteHeader } from '@gitroom/frontend/components/website/website.header';
import { WebsiteFooter } from '@gitroom/frontend/components/website/website.footer';
import { websiteUrl } from '@gitroom/frontend/components/website/website.company';

export const metadata: Metadata = {
  metadataBase: new URL(websiteUrl()),
  title: {
    default: 'Wrecking Social: Schedule It. Create It. Crush It.',
    template: '%s | Wrecking Social',
  },
  description:
    'Wrecking Social is a social media publishing platform. Create, schedule and publish posts to Facebook, Instagram, Threads, LinkedIn, TikTok, YouTube, Pinterest and more from one calendar.',
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
    apple: '/wrecking-social-icon-180.png',
  },
  openGraph: {
    siteName: 'Wrecking Social',
    type: 'website',
    images: ['/wrecking-social-icon-512.png'],
  },
};

export default function WebsiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={clsx(
          bricolageGrotesque.variable,
          dmSans.variable,
          'min-h-screen flex flex-col'
        )}
      >
        <WebsiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <WebsiteFooter />
      </body>
    </html>
  );
}
