export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { Inbox } from '@gitroom/frontend/components/inbox/inbox.component';
export const metadata: Metadata = {
  title: `Wrecking Social Inbox`,
  description: '',
};
export default async function Index() {
  return <Inbox />;
}
