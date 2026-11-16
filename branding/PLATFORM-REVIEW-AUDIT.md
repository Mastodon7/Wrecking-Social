# Platform app review audit: Wrecking Social

Audit date: 2026-11-16. This checks Wrecking Social against what Meta, TikTok,
Google/YouTube, LinkedIn, X, Pinterest, Reddit and Google Business Profile
reviewers look at. The full requirements, with sources, are in
[PLATFORM-REVIEW-REQUIREMENTS.md](PLATFORM-REVIEW-REQUIREMENTS.md).

Status: **Done** = in the code on this branch. **You** = only the business
can do it. **Code** = still needs building before that platform's review.

## Website

| Requirement | Who asks | Status |
|---|---|---|
| Public homepage that explains the product (not just a login page) | TikTok, Google | Done: `/` |
| Privacy Policy, Terms, Data Deletion and Contact links visible in the footer without a menu | TikTok, Google | Done: every website page and the sign-in page |
| Privacy Policy on the same domain as the homepage, clearly titled | Google, Meta, Pinterest | Done: `/privacy` |
| What is collected from each platform and how it is used, shared and kept | Meta, Google, TikTok, LinkedIn | Done: privacy sections 1-5 and the per-platform table |
| "Uses YouTube API Services", link to the Google Privacy Policy, how to revoke access via Google security settings | YouTube III.A.2 | Done: privacy section 4 |
| Google Limited Use statement | Google | Done: privacy section 4 |
| Data not sold, not used for ads, not used to train AI | Google, Pinterest, Reddit | Done: privacy section 2 |
| Cookie disclosure | YouTube III.A.2.g | Done: privacy section 1 |
| Terms bind users to the YouTube Terms of Service, with a link | YouTube III.A.1 | Done: terms section 3 |
| Terms require following each platform's terms; the user chooses what is posted | X, Pinterest, TikTok | Done: terms sections 3 and 5 |
| Data Deletion Instructions page (usable as Meta's "Data Deletion Instructions URL") | Meta | Done: `/data-deletion` |
| Deletion requests completed within 7 days | YouTube III.D | Done in the policy text. **You** must actually do it, see below |
| Contact page with business email and address | Meta, LinkedIn, YouTube | Done: `/contact`. **You:** a phone number is still missing |
| Legal business name matches the business verification documents | Meta, LinkedIn | **You:** the site says "Wrecking Social, a 25M Company". Replace it with the exact registered legal name in `apps/frontend/src/components/website/website.company.ts` |
| No platform names or logos in the app name or icon | LinkedIn, TikTok, Meta | Done: the icon is the wrecking-ball speech bubble |
| Crawlable, sitemap, robots | Meta, Google | Done: `/robots.txt`, `/sitemap.xml` |
| No inflated claims or other companies' testimonials | All (misleading content) | Done: removed Postiz's "20,000+ users" claims and testimonials |

## Inside the app (what reviewers see in your screencasts)

| Requirement | Platform | Status |
|---|---|---|
| Privacy level has no default, the user must choose | TikTok | Done (it defaulted to Public before) |
| Allow Comment / Duet / Stitch unchecked by default | TikTok | Done (Comments was checked before) |
| "By posting, you agree to TikTok's Music Usage Confirmation" above Publish on every direct post | TikTok | Done (before, it only showed with a brand disclosure) |
| Show the creator's TikTok nickname; use `creator_info` for privacy options, `can_post` and max video length | TikTok | **Code:** not built. The privacy list is hard-coded |
| Commercial content labels "Promotional content" and "Paid partnership"; branded content cannot be private | TikTok | **Code:** labels differ, and the private rule is not enforced |
| "Processing can take a few minutes" notice after posting | TikTok | **Code:** missing |
| Link to the YouTube Terms of Service on the upload screen, and a Community Guidelines confirmation | YouTube | Done: notice under the YouTube settings |
| Visible privacy status (public, unlisted, private) | YouTube | Done (already there) |
| Disconnecting a channel destroys its access token | Meta, Google, LinkedIn | Done: deleting a channel now destroys its tokens (before, they stayed in the database) |
| Meta data-deletion callback and Threads deauthorize callback | Meta, Threads | **Code:** not built. Use the instructions URL for Meta; Threads asks for the callback URLs |
| Every post is chosen by the user (no autopilot) | Pinterest, X | Done for normal posts. **Careful:** the RSS auto-post feature publishes on its own. Don't show it in Pinterest or X screencasts, and don't use it on those channels |

## Things only the business can do

1. **Deploy this version on wreckingsocial.com.** Set `FRONTEND_URL=https://wreckingsocial.com`. Reviewers check the live site, and today it still shows the old demo page.
2. **Use the exact legal name and add a phone number** on the site (one file: `website.company.ts`). They must match your business verification documents.
3. **Have a lawyer review** `/privacy` and `/terms`. They are written to match what the app really does, but they are not legal advice.
4. **Set up a business mailbox** such as privacy@ or support@wreckingsocial.com and use it for every developer account. Personal email fails LinkedIn.
5. **Verify the domain**: Google Search Console, TikTok URL verification (the website, terms, privacy and media URLs), and Meta Business Manager.
6. **Business presence:** a LinkedIn Company Page, Meta Business Verification, and a Google Business Profile with wreckingsocial.com as its website, active for 60+ days.
7. **Handle emailed deletion requests within 7 days.** Today that is a manual job: someone has to erase the account's remaining records.
8. **Honor the source-code offer.** Wrecking Social is built on Postiz, which is licensed AGPL-3.0, and the site says anyone can email to get the source of the version you run. Be ready to send it.
9. **Keep tracking off unless the policy changes too.** The app can turn on Google Tag Manager, a Facebook Pixel, Plausible or Datafast through environment variables. The privacy policy says there are no advertising cookies, so leave those off or update the policy first.
10. **For each platform submission:** record the screencasts on the live domain, in English, at 1080p, showing the full connect flow through to a published post. Also create a reviewer test login with posting unlocked.

## Business risks from the research

- **X:** the Developer Agreement's "service bureau" clause may not allow one shared X app posting for every customer. Get legal advice, or have each customer bring their own X app.
- **Reddit:** commercial schedulers need Reddit's approval and probably a paid contract.
- **LinkedIn Community Management:** a rejection is final for that app, so have everything ready before you apply.
- **TikTok:** the strictest UX audit. Finish the three TikTok **Code** items above before applying.
