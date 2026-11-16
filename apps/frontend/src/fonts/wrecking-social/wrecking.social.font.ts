import localFont from 'next/font/local';

// Brand fonts of Wrecking Social, both under the SIL Open Font License 1.1
export const bricolageGrotesque = localFont({
  src: [
    { path: './bricolagegrotesque.woff2', weight: '200 800', style: 'normal' },
  ],
  variable: '--font-ws-display',
});

export const dmSans = localFont({
  src: [{ path: './dmsans.woff2', weight: '100 1000', style: 'normal' }],
  variable: '--font-ws-body',
});
