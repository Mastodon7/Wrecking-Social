import { ReactNode } from 'react';

// Shared reports: no app chrome, no sign-in
export default function ReportLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
