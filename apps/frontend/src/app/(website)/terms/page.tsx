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
  title: 'Terms of Service',
  description:
    'The terms that apply when you use Wrecking Social, the social media publishing platform.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated={LEGAL_EFFECTIVE_DATE}>
      <p>
        These Terms of Service (&quot;Terms&quot;) are an agreement between you
        and {COMPANY_NAME} (&quot;Wrecking Social&quot;, &quot;we&quot;,
        &quot;us&quot;) and apply to your use of the Wrecking Social website
        and application (the &quot;Service&quot;). By creating an account or
        using the Service you accept these Terms. If you use the Service for a
        company, you accept them for that company and confirm you may do so.
      </p>

      <h2>1. The Service</h2>
      <p>
        Wrecking Social lets you connect social media accounts, create and
        schedule posts, publish them to those accounts, manage media, work
        with a team and view analytics. We may improve, change or stop parts
        of the Service. Features that depend on a social media platform can
        change or stop working when that platform changes its rules or
        technology.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must be at least 16 years old and able to form a binding
          contract.</li>
        <li>Give accurate information and keep it up to date.</li>
        <li>Keep your password safe. You are responsible for what happens in
          your account and workspace, including what your teammates do.</li>
        <li>Tell us right away at{' '}
          <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a> if you think
          someone used your account without permission.</li>
      </ul>

      <h2>3. Connected platforms</h2>
      <p>
        You may only connect accounts, pages and channels that you own or are
        authorized to manage. When you connect a platform, you authorize us to
        access it and publish to it on your behalf, as described in our{' '}
        <Link href="/privacy">Privacy Policy</Link>. You remain bound by each
        platform&apos;s own terms, policies and community guidelines, and you
        are responsible for following them, including for the content you
        publish through the Service. These include, for example, the{' '}
        <a href="https://www.facebook.com/terms" target="_blank" rel="noreferrer">
          Meta Terms
        </a>
        , the{' '}
        <a href="https://www.tiktok.com/legal/terms-of-service" target="_blank" rel="noreferrer">
          TikTok Terms of Service
        </a>
        , the{' '}
        <a href="https://www.linkedin.com/legal/user-agreement" target="_blank" rel="noreferrer">
          LinkedIn User Agreement
        </a>{' '}
        and the{' '}
        <a href="https://x.com/en/tos" target="_blank" rel="noreferrer">
          X Terms of Service
        </a>
        .
      </p>
      <p>
        <strong>YouTube:</strong> Wrecking Social uses YouTube API Services. By
        connecting a YouTube channel or uploading to YouTube through the
        Service, you agree to be bound by the{' '}
        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">
          YouTube Terms of Service
        </a>
        , and you acknowledge the{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
          Google Privacy Policy
        </a>
        .
      </p>
      <p>
        Wrecking Social is not affiliated with, endorsed by or sponsored by any
        of these platforms. Platform names are trademarks of their owners.
      </p>

      <h2>4. Your content</h2>
      <p>
        You keep all rights to the content you create or upload. You give us a
        limited, worldwide, non-exclusive, royalty-free license to host,
        store, copy, process, adapt (for example resize or convert media) and
        transmit your content only as needed to provide the Service to you,
        including publishing it to the platforms you choose. This license ends
        when you delete the content or your account, except for content
        already published to a platform, which stays under that
        platform&apos;s control.
      </p>
      <p>
        You confirm that you have the rights needed to publish your content
        and that it does not break the law or anyone&apos;s rights.
      </p>

      <h2>5. Acceptable use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>publish spam, misleading content, or content that is illegal,
          hateful, harassing, violent, sexually exploitative or that infringes
          intellectual property;</li>
        <li>impersonate anyone or post to accounts you are not authorized to
          manage;</li>
        <li>break the rules or limits of any connected platform, including by
          automating fake engagement;</li>
        <li>break into, overload, scrape or interfere with the Service or its
          security, or reverse engineer it except where the law or the
          open-source license in section 10 allows;</li>
        <li>send malware or collect other users&apos; data without
          permission.</li>
      </ul>
      <p>
        We may remove content or suspend accounts that break these rules, and
        platforms may do the same on their side.
      </p>

      <h2>6. AI features</h2>
      <p>
        Some features use artificial intelligence to suggest text or images.
        Suggestions can be wrong or unsuitable. Review everything before you
        publish it. You are responsible for what you publish.
      </p>

      <h2>7. Plans, billing and cancellation</h2>
      <ul>
        <li>Paid plans are billed in advance for each billing period through
          our payment processor, Stripe. Prices and plan limits are shown in
          the app before you buy.</li>
        <li>Plans renew automatically until you cancel. You can cancel any
          time from the Billing page. Cancellation takes effect at the end of
          the current billing period, and we do not refund partial periods
          unless the law requires it.</li>
        <li>If a free trial is offered, you will be charged when it ends
          unless you cancel before then.</li>
        <li>We may change prices with at least 30 days&apos; notice. The new
          price applies from your next billing period.</li>
        <li>You are responsible for taxes that apply to your purchase.</li>
      </ul>

      <h2>8. Ending the agreement</h2>
      <p>
        You can stop using the Service and delete your account at any time
        (see our <Link href="/data-deletion">Data Deletion</Link> page). We
        may suspend or end your access if you break these Terms, if required
        by law, or if a platform requires it. Sections that by their nature
        should continue (such as 4, 9, 11 and 12) continue after the
        agreement ends.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available&quot;.
        To the extent the law allows, we disclaim all warranties, express or
        implied, including merchantability, fitness for a particular purpose
        and non-infringement. We do not promise that the Service will be
        uninterrupted or error free, or that a platform will accept, keep or
        show any post, or that you will reach any audience or results.
      </p>

      <h2>10. Open-source software</h2>
      <p>
        Wrecking Social is built on Postiz, open-source software licensed
        under the GNU Affero General Public License version 3 (AGPL-3.0). You
        can get the complete source code of the version of the software we
        run, under that license, by emailing{' '}
        <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>. Nothing in
        these Terms limits your rights under that license.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the extent the law allows, Wrecking Social will not be liable for
        indirect, incidental, special, consequential or punitive damages, or
        for lost profits, revenue, data or goodwill. Our total liability for
        any claim about the Service is limited to the greater of the amount
        you paid us in the 12 months before the claim or 100 US dollars.
      </p>

      <h2>12. Indemnity</h2>
      <p>
        You will defend and hold us harmless from claims by third parties
        arising from your content or your breach of these Terms or of a
        platform&apos;s terms.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Illinois, USA,
        without regard to conflict-of-law rules. Disputes will be heard in the
        state or federal courts located in Cook County, Illinois, unless the
        law where you live gives you the right to bring a claim there.
      </p>

      <h2>14. Changes</h2>
      <p>
        We may update these Terms. We will change the date at the top and,
        for important changes, tell you by email or in the app before they
        take effect. If you keep using the Service after that, you accept the
        new Terms.
      </p>

      <h2>15. Contact</h2>
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
