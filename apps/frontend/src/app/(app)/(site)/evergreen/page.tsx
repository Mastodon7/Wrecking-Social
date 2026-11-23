export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { EvergreenComponent } from '@gitroom/frontend/components/evergreen/evergreen.component';
export const metadata: Metadata = {
  title: `Wrecking Social Evergreen`,
  description: '',
};
export default async function Index() {
  return <EvergreenComponent />;
}
