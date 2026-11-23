import { ReactNode } from 'react';

// The public link-in-bio pages: no app chrome, no sign-in
export default function BioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
