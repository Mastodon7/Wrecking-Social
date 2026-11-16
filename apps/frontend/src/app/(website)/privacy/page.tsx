import Link from 'next/link';
import { Metadata } from 'next';
import { LegalPage } from '@gitroom/frontend/components/website/legal.page';
import {
  COMPANY_ADDRESS_LINES,
  COMPANY_EMAIL,
  COMPANY_NAME,
  LEGAL_EFFECTIVE_DATE,
} from '@gitroom/frontend/components/website/website.company';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Wrecking Social collects, uses, shares, keeps and deletes your information, including data from connected social media accounts.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated={LEGAL_EFFECTIVE_DATE}>
      <p>
        This Privacy Policy explains how {COMPANY_NAME} (&quot;Wrecking
        Social&quot;, &quot;we&quot;, &quot;us&quot;) collects, uses, shares,
        keeps and deletes information when you use the Wrecking Social website
        at wreckingsocial.com and the Wrecking Social application (together,
        the &quot;Service&quot;). Wrecking Social is a social media publishing
        tool: it lets you connect your social media accounts, create posts,
        schedule them and publish them, and see statistics about them.
      </p>
      <p>
        If you have a question about this policy or your data, contact us at{' '}
        <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>.
      </p>

      <h2>1. Information we collect</h2>
      <h3>Information you give us</h3>
      <ul>
        <li>
          <strong>Account information:</strong> your name, email address,
          password (stored only as a one-way hash), time zone, language and
          profile picture, and the name of your workspace.
        </li>
        <li>
          <strong>Content:</strong> the posts, captions, comments, images,
          videos, signatures and other material you create or upload in the
          Service, and the dates and channels you schedule them for.
        </li>
        <li>
          <strong>Team information:</strong> the email addresses of people you
          invite to your workspace and their roles.
        </li>
        <li>
          <strong>Billing information:</strong> if you buy a paid plan, our
          payment processor Stripe collects your payment card details. We do
          not see or store your full card number. We keep your Stripe customer
          ID, plan and billing history.
        </li>
        <li>
          <strong>Messages:</strong> what you send us when you contact us.
        </li>
      </ul>

      <h3>Information from social media platforms you connect</h3>
      <p>
        When you connect a social media account (a &quot;channel&quot;), you
        sign in on that platform&apos;s own page and approve the access
        Wrecking Social asks for. We then receive:
      </p>
      <ul>
        <li>
          <strong>Access tokens</strong> (and refresh tokens where the platform
          provides them) that let us act on the account on your behalf;
        </li>
        <li>
          <strong>Basic profile information</strong> of the account or page:
          its ID, name, username and profile picture, and for business tools
          the list of pages, channels, boards or locations you manage and
          choose to connect;
        </li>
        <li>
          <strong>Post and performance information</strong> that the
          platform makes available for your own account, such as the IDs and
          links of posts we publish for you, and statistics like views,
          impressions, reach, likes, comments and followers, which we show to
          you in analytics.
        </li>
      </ul>
      <p>
        We only request the permissions a feature needs. The table below
        shows, for the main platforms, what we use the access for.
      </p>
      <table>
        <thead>
          <tr>
            <th>Platform</th>
            <th>What Wrecking Social does with your approval</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Facebook (Meta)</td>
            <td>
              Lists the Facebook Pages you manage so you can choose one,
              publishes the posts you schedule to that Page, and reads the
              Page&apos;s post and Page statistics for analytics.
            </td>
          </tr>
          <tr>
            <td>Instagram (Meta)</td>
            <td>
              Reads your Instagram professional account&apos;s profile,
              publishes the photos, videos, reels and carousels you schedule,
              and reads statistics of your posts for analytics.
            </td>
          </tr>
          <tr>
            <td>Threads (Meta)</td>
            <td>
              Reads your Threads profile, publishes the posts you schedule and
              reads their statistics.
            </td>
          </tr>
          <tr>
            <td>TikTok</td>
            <td>
              Reads your basic TikTok profile (display name and avatar) and the
              posting options TikTok returns for your account, and uploads the
              videos or photos you choose with the settings you pick.
            </td>
          </tr>
          <tr>
            <td>YouTube (Google)</td>
            <td>
              Reads your channel&apos;s name and picture, uploads the videos
              you schedule with the title, description, privacy status and
              other details you enter, and reads your videos&apos; statistics.
            </td>
          </tr>
          <tr>
            <td>Google Business Profile</td>
            <td>
              Lists the business locations you manage so you can choose one
              and publishes the updates you schedule to it.
            </td>
          </tr>
          <tr>
            <td>LinkedIn</td>
            <td>
              Reads your name and photo (and the LinkedIn Pages you
              administer, if you connect a Page) and publishes the posts you
              schedule.
            </td>
          </tr>
          <tr>
            <td>X, Pinterest, Reddit and others</td>
            <td>
              Read your account&apos;s basic profile (and for Pinterest your
              boards) and publish the posts, Pins or submissions you schedule.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        We do not read your private messages, we do not post anything you did
        not create or schedule, and we do not follow, like or comment on your
        behalf unless you set that up yourself.
      </p>

      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Log and device information:</strong> IP address, browser
          type and the pages and features you use, kept in server logs to run
          and secure the Service.
        </li>
        <li>
          <strong>Cookies:</strong> we use cookies that are needed to keep you
          signed in, protect your session and remember your language. We do
          not use advertising cookies or sell cookie data.
        </li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>to provide the Service: create your account, connect your
          channels, store your content, publish your posts at the time you
          choose, and show you analytics;</li>
        <li>to send you service messages, such as sign-in emails,
          notifications about failed posts and billing receipts;</li>
        <li>to keep the Service secure, prevent abuse and fix problems;</li>
        <li>to answer your questions and support requests;</li>
        <li>to meet our legal obligations.</li>
      </ul>
      <p>
        We do not sell your personal information, we do not use data from
        your connected accounts for advertising, and we do not use it to train
        artificial intelligence models.
      </p>

      <h2>3. How we share information</h2>
      <p>We share information only as follows:</p>
      <ul>
        <li>
          <strong>With the platforms you connect,</strong> when you publish:
          the content and settings of a post are sent to the platform you
          chose for it.
        </li>
        <li>
          <strong>With people in your workspace:</strong> teammates you invite
          can see the workspace&apos;s channels, posts and analytics.
        </li>
        <li>
          <strong>With service providers</strong> that run parts of the
          Service for us under contract and only on our instructions: our
          hosting and storage providers, our email delivery provider, Stripe
          for payments, and, only when you use an AI feature, our AI provider
          (such as OpenAI), which receives the text or request you send to
          that feature under terms that do not allow it to train its models on
          that data.
        </li>
        <li>
          <strong>For legal reasons:</strong> if the law requires it, or to
          protect the rights, safety or property of our users, the public or
          us.
        </li>
        <li>
          <strong>In a business transfer:</strong> if Wrecking Social is
          merged, sold or reorganized, information may move to the new owner,
          who must keep honoring this policy.
        </li>
      </ul>

      <h2>4. Google and YouTube</h2>
      <p>
        Wrecking Social uses YouTube API Services to let you upload videos to
        your YouTube channel and see their statistics. By connecting a YouTube
        channel you agree to be bound by the{' '}
        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">
          YouTube Terms of Service
        </a>
        . Google&apos;s handling of your information is described in the{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
          Google Privacy Policy
        </a>
        .
      </p>
      <p>
        Wrecking Social&apos;s use and transfer to any other app of information
        received from Google APIs will adhere to the{' '}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          target="_blank"
          rel="noreferrer"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. We use Google user data only
        to provide the features you see in the app, we do not transfer it to
        others except as needed to provide those features, for security, or to
        comply with the law, we do not use it for advertising, and no person
        reads it unless you ask us to (for example in a support request), it
        is needed for security, or the law requires it.
      </p>
      <p>
        You can remove Wrecking Social&apos;s access to your Google account at
        any time from your{' '}
        <a
          href="https://security.google.com/settings/security/permissions"
          target="_blank"
          rel="noreferrer"
        >
          Google security settings
        </a>
        , in addition to the ways in section 6.
      </p>

      <h2>5. How long we keep information</h2>
      <ul>
        <li>
          We keep your account information and content for as long as your
          account is open.
        </li>
        <li>
          Access tokens of a channel are kept while the channel is connected.
          When you delete a channel, its access tokens are destroyed right away
          and we stop all access to that account.
        </li>
        <li>
          When you delete your account, we immediately and irreversibly
          destroy your sign-in details and the access tokens of your channels,
          remove your posts and channels from the Service, and remove your
          personal details from your user record. Any remaining records of
          your content and media are permanently erased within 7 days when
          you ask us to (see section 6).
        </li>
        <li>
          We keep billing records as long as tax and accounting law requires,
          and server logs for up to 90 days.
        </li>
      </ul>

      <h2>6. Your choices and how to delete your data</h2>
      <ul>
        <li>
          <strong>Disconnect a channel:</strong> in the app, open the menu of
          the channel and choose <em>Delete</em>. You can also remove our
          access on the platform itself (for example Facebook Settings &gt;
          Business Integrations, TikTok Settings &gt; Security &gt; Manage app
          permissions, or Google security settings).
        </li>
        <li>
          <strong>Delete your account:</strong> go to{' '}
          <em>Settings &gt; Global Settings &gt; Delete Account</em>.
        </li>
        <li>
          <strong>Ask us:</strong> email{' '}
          <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a> from the
          email address of your account to access, correct, export or delete
          your data. We complete deletion requests within 7 days and other
          requests within 30 days.
        </li>
      </ul>
      <p>
        Step-by-step instructions, including for people who signed in with
        Facebook, are on our{' '}
        <Link href="/data-deletion">Data Deletion</Link> page.
      </p>

      <h2>7. Your rights</h2>
      <p>
        Depending on where you live, you may have the right to know what
        personal information we hold about you, to get a copy of it, to have
        it corrected or deleted, to object to or limit some uses, and to not
        be discriminated against for using these rights. California residents:
        we do not sell or &quot;share&quot; personal information as those words
        are defined in the California Consumer Privacy Act. To use any of these
        rights, contact us as shown below. You may also complain to your local
        data protection authority.
      </p>

      <h2>8. Security</h2>
      <p>
        We protect information with measures such as encrypted HTTPS
        connections, hashed passwords, encryption of the access tokens of
        your connected channels in our database, restricted access to our
        servers and databases, and keeping access tokens out of the browser. No method of
        storage or transmission is completely secure, so we cannot guarantee
        absolute security. If a breach affects your information, we will tell
        you as the law requires.
      </p>

      <h2>9. International transfers</h2>
      <p>
        We are based in the United States and process information there. If
        you use the Service from another country, your information is
        transferred to and processed in the United States.
      </p>

      <h2>10. Children</h2>
      <p>
        The Service is for businesses and adults. It is not directed to
        children under 16, and we do not knowingly collect information from
        them. If you believe a child has given us information, contact us and
        we will delete it.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy. We will change the date at the top and, for
        important changes, tell you by email or in the app before they take
        effect.
      </p>

      <h2>12. Contact us</h2>
      <p>
        {COMPANY_NAME}
        <br />
        {COMPANY_ADDRESS_LINES.map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
        Email: <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
      </p>
    </LegalPage>
  );
}
