import localFont from 'next/font/local';
import { Inter } from 'next/font/google';

// Headline font of the public website: Inter (SIL Open Font License 1.1),
// used heavy and tightly spaced. next/font downloads it at build time and
// serves it from our own domain, so no visitor request goes to Google
export const interDisplay = Inter({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-ws-display',
  display: 'swap',
});

// Body font, SIL Open Font License 1.1
export const dmSans = localFont({
  src: [{ path: './dmsans.woff2', weight: '100 1000', style: 'normal' }],
  variable: '--font-ws-body',
});
