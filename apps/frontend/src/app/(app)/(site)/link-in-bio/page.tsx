export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { BioComponent } from '@gitroom/frontend/components/bio/bio.component';
export const metadata: Metadata = {
  title: `Wrecking Social Link in Bio`,
  description: '',
};
export default async function Index() {
  return <BioComponent />;
}
