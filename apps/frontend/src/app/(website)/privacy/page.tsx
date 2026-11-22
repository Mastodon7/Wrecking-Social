import Link from 'next/link';
import { Metadata } from 'next';
import { LegalPage } from '@gitroom/frontend/components/website/legal.page';
import {
  COMPANY_ADDRESS_LINES,
  PRIVACY_EMAIL,
  COMPANY_NAME,
  COMPANY_PHONE,
  COMPANY_PHONE_LINK,
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
        <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
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
        When you connect a social media account (a &quot;channel&quot;), how
        you connect depends on the platform. For most platforms you sign in on
        the platform&apos;s own page and approve the access Wrecking Social
        asks for. For Bluesky, you enter your Bluesky handle and an app
        password that you create in Bluesky&apos;s settings for Wrecking
        Social (please do not use your main Bluesky password). We use the
        permission or credential you give us only to do what you ask in the
        app, such as publishing a scheduled post or showing analytics. What we
        receive depends on the account type and the permissions you grant:
      </p>
      <ul>
        <li>
          <strong>Access tokens or connection credentials</strong> (and
          refresh tokens where the platform provides them) that let us act on
          the account on your behalf. We store them encrypted;
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
        shows, for each platform you can connect, what we use the access
        for.
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
              Lists the Facebook Pages you manage so you can choose one, publishes
              the posts you schedule to that Page (and the follow-up comments
              you add to them), reads the Page&apos;s post and Page
              statistics for analytics, and reads the comments people leave
              on those posts so you can answer them from the Inbox.
            </td>
          </tr>
          <tr>
            <td>Instagram (Meta)</td>
            <td>
              Reads your Instagram professional account&apos;s profile,
              publishes the photos, videos, reels and carousels you schedule
              (and the follow-up comments you add to them), reads
              statistics of your account and posts for analytics, and reads
              the comments people leave on those posts so you can answer them
              from the Inbox.
            </td>
          </tr>
          <tr>
            <td>Threads (Meta)</td>
            <td>
              Reads your Threads profile, publishes the posts you schedule and
              the replies you add to them, reads their statistics, and reads
              the replies people leave on them so you can answer them from
              the Inbox.
            </td>
          </tr>
          <tr>
            <td>TikTok</td>
            <td>
              Reads your TikTok profile (display name, avatar and username),
              the posting options TikTok returns for your account, your
              account statistics (such as followers and likes) and the list
              of your videos with their statistics for analytics, and uploads
              the videos or photos you choose with the settings you pick.
            </td>
          </tr>
          <tr>
            <td>YouTube (Google)</td>
            <td>
              Reads your channel&apos;s name and picture, uploads the videos
              you schedule with the title, description, privacy status and
              other details you enter, reads your channel and video
              statistics from YouTube Analytics, and reads the comments
              people leave on those videos so you can answer them from the
              Inbox.
            </td>
          </tr>
          <tr>
            <td>Google Business Profile</td>
            <td>
              Lists the business locations you manage so you can choose one,
              publishes the updates you schedule to it and reads its
              statistics for analytics.
            </td>
          </tr>
          <tr>
            <td>LinkedIn</td>
            <td>
              Reads your name and photo (and the LinkedIn Pages you administer,
              if you connect a Page), publishes the posts you schedule and
              the follow-up comments you add to them, and, for Pages, reads
              Page and post statistics for analytics and the comments people
              leave on the Page&apos;s posts so you can answer them from the
              Inbox.
            </td>
          </tr>
          <tr>
            <td>Pinterest</td>
            <td>
              Reads your account&apos;s profile and your boards so you can
              choose one, publishes each Pin you create and schedule, and reads
              your account and Pin statistics for analytics.
            </td>
          </tr>
          <tr>
            <td>Bluesky</td>
            <td>
              Signs in to your account with the handle and app password you
              enter, reads your profile (display name, handle and picture),
              publishes the posts you schedule and the replies you add to
              them, and reads the public replies people leave on those posts
              so you can answer them from the Inbox.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        We do not read your private messages, and we do not post anything you
        did not create or schedule. We do not follow, like or comment on your
        behalf, except for the replies you write yourself in the Inbox and
        the optional automations you turn on yourself for a post (for
        example, adding a reply once the post reaches a number of likes),
        which you can turn off at any time.
      </p>
      <p>
        We do not store content or statistics from these platforms beyond what
        the Service needs: the profile of each connected account and the IDs
        and links of the posts we publish for you. Statistics are fetched from
        the platform when you open analytics and kept in a temporary cache for
        up to one hour.
      </p>
      <p>
        The Inbox shows the comments and replies people leave on posts
        published through Wrecking Social in the last 30 days (the
        commenter&apos;s name, username and picture as the platform shows
        them, the comment text and its date). They are fetched from the
        platform when you open the Inbox and kept in a temporary cache for up
        to two minutes; we do not store them, and nothing from the Inbox is
        sent to an AI provider. When you reply, your reply is sent to the
        platform as the connected account and is not kept by us.
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
          can see and use the workspace&apos;s channels, posts and analytics,
          including statistics from YouTube and the other platforms you
          connect. Only invite people you want to have that access.
        </li>
        <li>
          <strong>With service providers</strong> that run parts of the
          Service for us under contract and only on our instructions: our
          hosting and storage providers, our email delivery provider, Stripe
          for payments, and, only when you use an AI feature, our AI provider
          (such as OpenAI), which receives your request and the information
          needed to answer it (for example the text of a post or the names of
          your connected channels) under terms that do not allow it to train
          its models on that data. Statistics and other content we receive
          from Google APIs are never sent to an AI provider; only the name of
          a connected channel may be, when you ask the AI assistant about your
          channels.
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
        You can remove a YouTube or Google Business Profile connection in
        Wrecking Social, or revoke our access at any time in your{' '}
        <a
          href="https://security.google.com/settings/security/permissions"
          target="_blank"
          rel="noreferrer"
        >
          Google account permissions
        </a>
        . What happens to the data we stored under that authorization:
      </p>
      <ul>
        <li>
          <strong>You delete the channel in Wrecking Social:</strong> we ask
          Google to revoke our access right away and delete its access tokens,
          channel profile and the IDs and links of its published videos and
          posts right away, and always within 7 days. If the same channel is
          still connected in another Wrecking Social workspace, that workspace
          keeps its own access.
        </li>
        <li>
          <strong>You delete your Wrecking Social account, or ask us to delete
          your stored YouTube data:</strong> we delete it within 7 days.
          Deleting your account does not need a second request.
        </li>
        <li>
          <strong>You revoke access in your Google account settings:</strong>{' '}
          we check every connected YouTube and Google Business Profile channel
          daily, and delete the data we stored for it within 15 days of the
          revocation.
        </li>
      </ul>
      <p>
        Deleting data from Wrecking Social does not delete your videos or
        anything else on YouTube or Google.
      </p>

      <h2>5. How long we keep information</h2>
      <ul>
        <li>
          We keep your account information and content for as long as your
          account is open.
        </li>
        <li>
          Access tokens or credentials and the profile of a channel (its name,
          username and picture) are kept while the channel is connected.
        </li>
        <li>
          <strong>When you delete a channel,</strong> we ask the platform to
          cancel our access where the platform supports it (YouTube and Google
          Business Profile), destroy its tokens and profile right away, cancel
          its scheduled posts, and remove the IDs and links the platform
          returned for its published posts. Posts already published stay on
          the platform; delete them there if you want them gone.
        </li>
        <li>
          <strong>If you remove our access in the platform&apos;s own
          settings,</strong> we can no longer use that authorization. The
          channel shows as needing to be reconnected the next time we contact
          the platform: every day for YouTube and Google Business Profile, and
          for the other platforms when a post is due or analytics are loaded.
          A channel that stays disconnected for 13 days is erased
          automatically with its data. To remove a channel and its data right
          away, delete it in the app or follow our{' '}
          <Link href="/data-deletion">Data Deletion</Link> page.
        </li>
        <li>
          <strong>When you delete your account,</strong> we immediately cancel
          the paid subscription of workspaces you own, ask the platforms to
          cancel our access where supported, destroy your sign-in details and
          the tokens and profiles of the channels in workspaces you own,
          remove the platform IDs and links of their posts, cancel scheduled
          posts, and remove your personal details from your user record. If
          you are a member of a workspace someone else owns, you are removed
          from it and its channels and posts stay with its owner. Your own
          posts and uploaded media are removed from the Service right away and
          permanently erased within 7 days when you ask us to (see section 6).
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
          permissions, Bluesky Settings &gt; App Passwords, or Google account
          permissions). Removing access on the platform stops us from using
          it; section 5 explains when the data we stored is then erased.
        </li>
        <li>
          <strong>Delete your account:</strong> go to{' '}
          <em>Settings &gt; Global Settings &gt; Delete Account</em>.
        </li>
        <li>
          <strong>Ask us:</strong> email{' '}
          <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> from the
          email address of your account to access, correct, export or delete
          your data. We complete deletion requests within 7 days and other
          requests within 30 days.
        </li>
      </ul>
      <p>
        Step-by-step instructions for every platform are on our{' '}
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
        Email: <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
        <br />
        Phone: <a href={COMPANY_PHONE_LINK}>{COMPANY_PHONE}</a>
      </p>
    </LegalPage>
  );
}
