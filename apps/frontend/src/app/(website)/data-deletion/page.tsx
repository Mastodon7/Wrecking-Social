import Link from 'next/link';
import { Metadata } from 'next';
import { LegalPage } from '@gitroom/frontend/components/website/legal.page';
import {
  COMPANY_EMAIL,
  LEGAL_EFFECTIVE_DATE,
} from '@gitroom/frontend/components/website/website.company';

export const metadata: Metadata = {
  title: 'Data Deletion Instructions',
  description:
    'How to disconnect a social media account from Wrecking Social, delete your Wrecking Social account, or ask us to delete your data.',
  alternates: { canonical: '/data-deletion' },
};

export default async function DataDeletionPage(props: {
  searchParams: Promise<{ code?: string }>;
}) {
  // Meta sends people here with the confirmation code of a deletion request
  // made from their Facebook, Instagram or Threads settings
  const { code } = await props.searchParams;
  const confirmationCode = /^[a-f0-9]{16}$/.test(code || '') ? code : '';

  return (
    <LegalPage title="Data Deletion Instructions" updated={LEGAL_EFFECTIVE_DATE}>
      {!!confirmationCode && (
        <div className="rounded-[14px] border border-ws-green/40 bg-ws-inkSoft p-[20px] mb-[24px]">
          <h2 className="!mt-0">Your deletion request is complete</h2>
          <p>
            Confirmation code: <strong>{confirmationCode}</strong>
          </p>
          <p className="!mb-0">
            We received this request from Meta. Wrecking Social&apos;s access to
            the account was removed, its scheduled posts were cancelled and its
            access tokens were destroyed. To have every remaining record about
            you erased, email us with this code as described in Option 3 below.
          </p>
        </div>
      )}
      <p>
        You can remove a connected social media account, delete your whole
        Wrecking Social account, or ask us to delete your data at any time.
        This page explains each option. For details on what we collect and
        keep, see our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Option 1: Disconnect one social media account</h2>
      <ol>
        <li>Sign in to Wrecking Social.</li>
        <li>In the list of channels on the left of the calendar, open the
          menu of the channel you want to remove.</li>
        <li>Choose <strong>Delete</strong> and confirm.</li>
      </ol>
      <p>
        The channel&apos;s access tokens and profile (name, username and
        picture) are destroyed immediately, its scheduled posts are
        cancelled, and Wrecking Social can no longer access
        that account.
      </p>

      <h2>Option 2: Delete your Wrecking Social account</h2>
      <ol>
        <li>Sign in to Wrecking Social.</li>
        <li>Go to <strong>Settings &gt; Global Settings</strong>.</li>
        <li>Click <strong>Delete Account</strong> and confirm.</li>
      </ol>
      <p>
        Your sign-in details and the access tokens of all your channels are
        destroyed immediately, and your posts, channels and workspaces are
        removed from the Service. Workspaces you own are deleted together with
        their channels, and you are removed from workspaces you were invited
        to. The app tells you before you confirm if this affects other
        members or an active subscription.
      </p>

      <h2>Option 3: Ask us to delete your data</h2>
      <p>
        If you cannot sign in, or you want every remaining record about you
        permanently erased, email{' '}
        <a href={`mailto:${COMPANY_EMAIL}?subject=Data%20deletion%20request`}>
          {COMPANY_EMAIL}
        </a>{' '}
        with the subject &quot;Data deletion request&quot;, from the email
        address you used for Wrecking Social. Tell us which account or channels
        the request is about. We will confirm we received it, may ask you to
        verify that the account is yours, and will complete the deletion
        within 7 days, then confirm by email.
      </p>

      <h2>Remove our access from the platform itself</h2>
      <p>
        You can also remove Wrecking Social&apos;s access directly in each
        platform&apos;s settings. This stops our access right away. After that,
        delete the channel in Wrecking Social (Option 1) or contact us to
        delete the data we already hold.
      </p>
      <ul>
        <li>
          <strong>Facebook and Instagram:</strong> on Facebook, go to{' '}
          <em>Settings &amp; privacy &gt; Settings &gt; Business
          integrations</em> (or <em>Apps and websites</em>), find Wrecking
          Social and click <em>Remove</em>. Meta then tells us, and we
          disconnect the account and destroy its access tokens automatically.
        </li>
        <li>
          <strong>Google and YouTube:</strong> open your{' '}
          <a
            href="https://security.google.com/settings/security/permissions"
            target="_blank"
            rel="noreferrer"
          >
            Google security settings
          </a>
          , select Wrecking Social and choose <em>Remove access</em>.
        </li>
        <li>
          <strong>TikTok:</strong> in the TikTok app, go to{' '}
          <em>Profile &gt; Settings and privacy &gt; Security &gt; Manage app
          permissions</em> and remove Wrecking Social.
        </li>
        <li>
          <strong>Threads:</strong> in the Threads app, go to{' '}
          <em>Settings &gt; Account &gt; Website permissions</em>, find
          Wrecking Social and remove it.
        </li>
        <li>
          <strong>Instagram (connected without a Facebook Page):</strong> in
          the Instagram app, go to{' '}
          <em>Settings &gt; Website permissions &gt; Apps and websites</em>,
          find Wrecking Social and remove it.
        </li>
        <li>
          <strong>LinkedIn:</strong> go to{' '}
          <em>Settings &gt; Data privacy &gt; Permitted services</em> and
          remove Wrecking Social.
        </li>
        <li>
          <strong>X:</strong> go to{' '}
          <em>Settings and privacy &gt; Security and account access &gt; Apps
          and sessions &gt; Connected apps</em> and revoke Wrecking Social.
        </li>
        <li>
          <strong>Pinterest:</strong> go to{' '}
          <em>Settings &gt; Security and logins &gt; Apps</em> and revoke
          access for Wrecking Social.
        </li>
      </ul>

      <h2>What we keep after deletion</h2>
      <p>
        Posts that were already published stay on the platforms where they
        were published. Delete them there if you want them gone. We keep
        billing records for as long as tax law requires, and we may keep a
        record that a deletion request was completed.
      </p>
    </LegalPage>
  );
}
