export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { internalFetch } from '@gitroom/helpers/utils/internal.fetch';
import { ReportData, ReportView } from '@gitroom/frontend/components/reports/report.view';
import { PrintButton } from '@gitroom/frontend/components/reports/print.button';

export const metadata: Metadata = {
  title: 'Social media report',
  robots: { index: false, follow: false },
};

export default async function SharedReport(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(token)) notFound();
  const res = await internalFetch(`/public/reports/${token}`);
  if (!res.ok) notFound();
  const data = (await res.json()) as ReportData;
  return <ReportView data={data} actions={<PrintButton />} />;
}
