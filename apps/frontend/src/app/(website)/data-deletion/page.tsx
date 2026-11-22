import Link from 'next/link';
import { Metadata } from 'next';
import { LegalPage } from '@gitroom/frontend/components/website/legal.page';
import {
  PRIVACY_EMAIL,
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
        This stops Wrecking Social from using that connection. Right away, we
        destroy the channel&apos;s access tokens or credentials and its
        profile (name, username and picture), cancel its scheduled posts, and
        remove the IDs and links the platform returned for its published
        posts and the engagement statistics we stored for them. For YouTube and Google Business Profile we also ask Google to
        revoke our access (unless the same channel is still connected in
        another Wrecking Social workspace). Statistics fetched for the
        Analytics page are only cached for up to one hour. Posts already
        published stay on the platform.
      </p>

      <h2>Option 2: Delete your Wrecking Social account</h2>
      <ol>
        <li>Sign in to Wrecking Social.</li>
        <li>Go to <strong>Settings &gt; Global Settings</strong>.</li>
        <li>Click <strong>Delete Account</strong> and confirm.</li>
      </ol>
      <p>
        Right away, we cancel the paid subscription of the workspaces you own,
        destroy your sign-in details, and delete the workspaces you own
        together with their channels (the same steps as Option 1 for each
        channel) and scheduled posts. Other members of those workspaces lose
        access to them. If you are a member of a workspace someone else owns,
        you are only removed from it; its channels and posts stay with its
        owner. YouTube and Google Business Profile data is deleted as part of
        this, without a separate request. Your own posts and uploaded media
        are removed from the Service; to have them permanently erased, use
        Option 3.
      </p>

      <h2>Option 3: Ask us to delete your data</h2>
      <p>
        If you cannot sign in, or you want every remaining record about you
        permanently erased, email{' '}
        <a href={`mailto:${PRIVACY_EMAIL}?subject=Data%20deletion%20request`}>
          {PRIVACY_EMAIL}
        </a>{' '}
        with the subject &quot;Data deletion request&quot;, from the email
        address you used for Wrecking Social if you can. Tell us what you want
        deleted: your whole account, a specific channel or specific records.
        Never send us a password or a connection credential. We will confirm
        we received it, may ask you to verify that the account is yours, and
        will complete the deletion within 7 days, then confirm by email.
      </p>

      <h2>Remove our access from the platform itself</h2>
      <p>
        You can also remove Wrecking Social&apos;s access in each
        platform&apos;s own settings. Removing access there and deleting data
        from Wrecking Social are different: removing access stops us from
        using the connection, and the data we stored is then erased as
        follows.
      </p>
      <ul>
        <li>
          <strong>YouTube and Google Business Profile:</strong> we check every
          connected channel daily, and the data we stored for it is deleted
          within 15 days of you revoking access. See the{' '}
          <Link href="/privacy">Privacy Policy</Link> (section 4) for all
          YouTube deletion timelines.
        </li>
        <li>
          <strong>Other platforms:</strong> the channel shows as needing to be
          reconnected the next time we contact the platform (when a post is
          due or analytics are loaded) and is erased automatically 13 days
          later.
        </li>
      </ul>
      <p>
        To have the data deleted right away, delete the channel in Wrecking
        Social (Option 1) or email us (Option 3). Where to remove access on
        each platform:
      </p>
      <ul>
        <li>
          <strong>Facebook and Instagram:</strong> on Facebook, go to{' '}
          <em>Settings &amp; privacy &gt; Settings &gt; Business
          integrations</em> (or <em>Apps and websites</em>), find Wrecking
          Social and click <em>Remove</em>. To also ask Meta to have your
          data deleted, choose to send a deletion request when Facebook
          offers it.
        </li>
        <li>
          <strong>YouTube and Google Business Profile:</strong> open your{' '}
          <a
            href="https://security.google.com/settings/security/permissions"
            target="_blank"
            rel="noreferrer"
          >
            Google account permissions
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
          <strong>Bluesky:</strong> go to{' '}
          <em>Settings &gt; Privacy and security &gt; App passwords</em> and
          delete the app password you created for Wrecking Social.
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
        record that a deletion request was completed. Server logs are kept
        for up to 90 days.
      </p>
    </LegalPage>
  );
}
