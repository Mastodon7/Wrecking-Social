export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { InsightsComponent } from '@gitroom/frontend/components/insights/insights.component';
export const metadata: Metadata = {
  title: `Wrecking Social Insights`,
  description: '',
};
export default async function Index() {
  return <InsightsComponent />;
}
