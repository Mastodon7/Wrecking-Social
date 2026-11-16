# Platform App-Review Requirements for a Social Scheduling SaaS

**Applicant:** Wrecking Social (wreckingsocial.com), a self-hosted Postiz fork run by a small Chicago company and sold as SaaS to businesses.
**Research date:** 2026-11-16. Sources are 2025-2026 web pages. Official platform documentation is preferred throughout.
**Legend:**
- **[Official]** means confirmed on the platform's own docs page.
- **[3rd-party]** means it comes from blogs, consultants or forums and is likely, but not confirmed.
- **[Unverified]** means I could not confirm it in this session.

---

## 1. Meta: Facebook Pages + Instagram (Facebook Login and/or Instagram API with Instagram Login)

Key permissions:
- Facebook: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`.
- Instagram via Facebook Login: `instagram_basic`, `instagram_content_publish`.
- Instagram via Instagram Login: `instagram_business_basic`, `instagram_business_content_publish`.

A multi-customer SaaS is a "Tech Provider", so it needs **Advanced Access**, which means App Review plus Business Verification.

### 1.1 Website must-haves
- **Privacy policy URL** [Official]. Source: https://developers.facebook.com/docs/development/terms-and-policies/privacy-policy/
  - The URL must be "active, publicly available, easily accessible (including by our crawlers), and non-geoblocked".
  - The page must be "clearly marked as a privacy policy".
  - It must be "your own privacy policy, and not the policy of another company".
  - Links must work both in the dashboard and on your site. Meta suggests checking for a 200 response with the Sharing Debugger.
  - Content must cover:
    - the data you collect, including automatically collected data and data from a permissions API;
    - a clear purpose for processing it;
    - "a clear way for users to request the deletion of their data", such as an email address or contact form that is current and valid.
- **Data deletion** [Official]. Source: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
  - You need either a Data Deletion Instructions URL (a public help page) or a Data Deletion Request Callback URL.
  - If you use the callback:
    - It must be HTTPS.
    - It receives a POST with a `signed_request` (HMAC-SHA256 with the app secret) that contains the user's app-scoped `user_id`.
    - It returns `{ url, confirmation_code }`.
    - The `url` must be a human-readable status page for the request.
  - The privacy policy must also explain deletion either way.
- **Business website for Business Verification** [3rd-party: vendor help pages, e.g. https://support.wati.io/en/articles/11463208-meta-business-verification-required-documents-by-country, https://docs.360dialog.com/docs/resources/meta-business-verification]
  - The site must be live, HTTPS and public.
  - It should show the legal business name or logo.
  - A domain email matching the website (not Gmail) is strongly preferred.
- **Terms of Service URL:** an optional field in Settings > Basic, but recommended [Unverified as required].

### 1.2 Submission must-haves
Source for the items below unless noted: https://developers.facebook.com/docs/resp-plat-initiatives/individual-processes/app-review/submission-guide
- **App icon** [Official]: 1024x1024, with no Meta trademarks or logos.
- **App settings** [Official]: app category, app purpose = "Clients", and a primary contact email you can access.
- **API calls** [Official]: at least one successful API call per permission within 30 days before you request Advanced Access. Until then the button stays greyed out.
- **Usage description** [Official]: a separate one per permission ("Do not copy and paste") covering:
  - how the permission helps users;
  - why the app needs it;
  - how the data is used;
  - why the app would be less useful without it.
- **Screencast for each permission** [Official]:
  - English UI, or captions and tool-tips if not.
  - Recorded at 1080p or better, with a monitor width of 1440 or less.
  - Shows "an app user granting your app each permission" (the full login and consent flow) and then how the app uses each permission.
  - Shows only the app window, with an enlarged cursor and no audio.
  - Instagram: "end-to-end user experience for that specific permission". Source: https://developers.facebook.com/docs/instagram-platform/app-review
- **Reviewer access** [Official]:
  - The app must be publicly reachable, or you give access instructions.
  - Do not give personal Meta credentials. Meta uses its own test users.
  - Give app login credentials, or a sign-up path, so reviewers can reach the posting feature.
- **Business Verification** [Official, mentioned as Step 1.5 of the submission guide]:
  - Legal name, address, phone, website, and official registration documents (for example articles of organization or an IL LLC certificate, an EIN letter, or a utility or bank statement showing the business name and address/phone) [3rd-party for the document list].
  - The data-handling questionnaire unlocks only after BV is approved [Official].
- **Separate apps** [Official]: Facebook Login and Instagram Login cannot be combined in one app ("Facebook Login or Instagram Login but not both"). Use separate Meta apps if you support both IG paths.

### 1.3 In-app UX must-haves
- A visible "Continue with Facebook" / Instagram connect button that reviewers can find and use. "If reviewers can't find Facebook Login or can't log in with it, the entire submission is rejected." [Official]
- The screencast must show the user picking the Page or IG account and then publishing a real post through the app [Official, implied by "show how the app uses each permission"].
- Meta logos and trademarks should not appear in the app icon or name [Official for the icon; Unverified for the name].

### 1.4 Common rejection reasons
Source: https://developers.facebook.com/docs/app-review/submission-guide/common-mistakes
- **[Official]**
  - The app is inaccessible to reviewers, which rejects the whole submission.
  - A screencast is missing for a permission.
  - The app is still in development.
  - Permissions are requested for future features.
  - Facebook Login is broken or can't be found.
  - Fake account credentials are supplied.
  - Usage descriptions are copy-pasted.
  - Settings are changed after submission.
  - The app goes to Live mode before review completes.
- **[3rd-party]**
  - Business Verification is pending or rejected.
  - The privacy policy doesn't specifically cover Facebook/IG data retention and deletion.
  - The deletion URL or callback doesn't work.
  - The screencast starts already logged in, or uses a personal profile instead of a Page.

---

## 2. Threads API

Permissions: `threads_basic` (required) and `threads_content_publish`. This is a separate "Access the Threads API" use case in a Meta app.

### 2.1 Website must-haves
- The same privacy policy rules as Meta (§1.1) apply. Add Threads data to the policy.
- **Deauthorize (uninstall) callback URL** [Official]: "the URL Meta will ping when a user deauthorizes your app". Source: https://developers.facebook.com/docs/development/create-an-app/threads-use-case
- **Data Deletion Requests URL** [Official]: "the URL Meta will ping when someone requests that you delete their data". Same source.
- **Privacy Policy URL** [Official]: required to publish the app.

### 2.2 Submission must-haves
- Valid OAuth redirect URIs [Official].
- App Review for each permission, because you are a Tech Provider, and the app must be published [Official].
- A screencast per permission showing the Threads login and an actual Threads post. Reviewers reportedly reject Instagram substitutes [3rd-party: https://postproxy.dev/blog/how-to-post-to-threads-via-api/].
- Business Verification is likely required for Advanced Access, as with other Meta permissions [Unverified for Threads specifically].

### 2.3 In-app UX
- No Threads-specific UX rules were found [Unverified]. Show a clear "Connect Threads" step and the publish action.

### 2.4 Common rejection reasons
- Same as Meta (§1.4).
- The screencast shows the wrong platform flow [3rd-party].

---

## 3. TikTok: Login Kit + Content Posting API (Direct Post)

Scopes: `user.info.basic` and `video.publish` (plus `video.upload` if you use upload-to-inbox drafts).

### 3.1 Website must-haves
Source: https://developers.tiktok.com/doc/app-review-guidelines
- **[Official]** "A valid official website that houses information about your web and services."
- **[Official]** "Your website URL cannot be a landing page or login page"; it must be "an externally facing fully developed website".
- **[Official]** Privacy Policy and Terms of Service must be **visible on the website without opening a menu** (for example, footer links in plain view on the homepage) and must be active.
- **[Official]** URL verification: for apps created after Sept 9, 2024, the ToS URL, Privacy URL and Web URL must be verified as owned by you (domain/URL-prefix verification in the developer portal).
- **[Official]** If you use `PULL_FROM_URL`, media must come from a **verified domain or URL prefix**. Wrecking Social's media/CDN domain must be verified. Source: https://developers.tiktok.com/doc/content-posting-api-get-started
- **[3rd-party]** The privacy policy and ToS should mention TikTok data specifically (what is collected via Login Kit, how it is used and how it is deleted). Source: https://bundle.social/blog/tiktok-api-approval

### 3.2 Submission must-haves
Source: https://developers.tiktok.com/doc/app-review-guidelines unless noted.
- **App name** [Official]: must match your app or website name. It must not reference social companies (no "TikTok"). It must follow TikTok brand guidelines.
- **App icon** [Official]: a clear image, consistent with the brand and not confusable with well-known brand icons.
- **Description** [Official]: what the app does and how it works. It must not be for private/personal use. "Apps still in development or testing will not be approved."
- **Demo video** [Official]:
  - At least one video, up to 5 videos of 50 MB each.
  - Shows the complete end-to-end flow of the current integration, including the UI and interactions.
  - **The domain shown in the video must match the submitted website URL.**
  - Every requested product and scope must be demonstrated; remove the ones you don't use.
  - New apps must demonstrate the integration with the **sandbox** environment.
- **Per-product explanation** [Official]: how each product or scope enriches the user experience.
- **Demo accounts** [Official]: provided to reviewers free of charge if requested.
- **Redirect URI** [Official]: a valid one for web apps.
- **Direct Post audit** [Official]: a separate audit with usage estimates.
  - Unaudited clients: max 5 users per 24h, private accounts only, `SELF_ONLY` visibility.
  - Source: https://developers.tiktok.com/doc/content-sharing-guidelines

### 3.3 In-app UX must-haves (Direct Post)
These are mandatory and checked in the audit [Official]. Source: https://developers.tiktok.com/doc/content-sharing-guidelines
1. **Creator info**
   - Call `creator_info` every time the post page renders.
   - Show the creator's **nickname** so the user knows which account receives the post.
   - If `can_post` is false, block posting and tell the user to try later.
   - Check video length against `max_video_post_duration_sec`.
2. **Privacy level**
   - A dropdown populated only from `privacy_level_options`.
   - **No default value**: the user must choose.
3. **Interactions (Comment / Duet / Stitch)**
   - **All unchecked by default.**
   - Greyed out if the creator has them disabled.
   - Photo posts show only Comment.
4. **Commercial content disclosure**
   - Toggle **off by default**. When it is on, show the "Your brand" and "Branded content" checkboxes and require at least one.
   - If the toggle is on and nothing is selected, show the hover text: "You need to indicate if your content promotes yourself, a third party, or both."
   - Labels:
     - Your brand: "Your photo/video will be labeled as 'Promotional content'".
     - Branded content: "...labeled as 'Paid partnership'".
   - Branded content cannot be private. Either disable Private, with the hover text "Branded content visibility cannot be set to private.", or switch to public and notify the user.
5. **Declaration above the Publish button** (exact text, with links):
   - Default / Your brand: **"By posting, you agree to TikTok's Music Usage Confirmation."**
   - Branded content: **"By posting, you agree to TikTok's Branded Content Policy and Music Usage Confirmation."**
6. **Caption and content**
   - The user can edit the title/caption, including preset hashtags.
   - **No watermarks, logos, brand names, links or promotional text added by the app.**
7. **Preview and consent**
   - Show a content preview.
   - Do not upload until the user expressly consents.
8. **Processing notice**
   - Tell users that processing can take a few minutes.
   - Poll the status API or use webhooks to show post status.

### 3.4 Common rejection reasons
- **[Official]**
  - The site is a landing or login page.
  - Policy links are hidden in a menu.
  - The app is unfinished or in testing.
  - Scopes are unused or not demoed.
  - The video domain doesn't match the website URL.
  - The app name references TikTok.
- **[3rd-party]**
  - Missing creator nickname, privacy dropdown, interaction toggles or commercial disclosure.
  - One-click publish with no review screen.
  - Unverified media domain.
  - Generic use-case text.
  - Sources: https://bundle.social/blog/tiktok-api-approval, https://github.com/gitroomhq/postiz-app/issues/1362

---

## 4. LinkedIn: Share on LinkedIn + Community Management API

- **Share on LinkedIn** (`w_member_social`, personal profile posting) is self-serve from the Products tab [3rd-party: https://www.upload-post.com/linkedin-api/].
- **Community Management API** (Company Page posting, comments, analytics) is vetted: Development tier first, then Standard tier.
- **Community Management must be the only product on its developer app** [Official]. Source: https://learn.microsoft.com/en-us/linkedin/shared/linkedin-api-partner-support-guide
  - So use one app for Share/Sign-In and a separate app for Community Management.

### 4.1 Website must-haves
Source for §4.1 to §4.3: https://learn.microsoft.com/en-us/linkedin/marketing/community-management-app-review
- **[Official]** An organization website, with a **verified website and domain**, and a **privacy policy**. A "valid privacy policy" is a Standard-tier criterion.
- **[Official]** Compliance with data storage requirements: https://learn.microsoft.com/en-us/linkedin/marketing/data-storage-requirements. The privacy policy should reflect retention and deletion of LinkedIn member data [inference].
- **[Official]** The **business email domain** must be verified, and personal emails fail. So use, for example, dev@wreckingsocial.com, matching the website domain.

### 4.2 Submission must-haves
- **Development tier** [Official]
  - "Only available to registered legal organizations for commercial use cases only".
  - Provide the legal name, registered address, website, privacy policy and a verified business email.
  - A **super admin of the company's LinkedIn Page must verify the app** (associate the app with the Page).
  - The app name and logo must **not include any part of LinkedIn or Microsoft names or logos** ("Linked" or "In").
  - Read the Marketing API Terms and the restricted use cases.
- **Standard tier** [Official]
  - Full integration completed.
  - A company and product overview, a use-case description and **test credentials** for reviewers.
  - A high-resolution, **downloadable** screencast limited to app screens, with narration recommended. For Page Management it must show:
    - the complete OAuth flow;
    - posting to a Page;
    - how a member's comment on that post is displayed;
    - which commenter profile fields are shown;
    - any other use of member data.
  - Similar checklists exist for Executive/Employee Advocacy (posting to a profile) and Page Analytics.
  - If a feature isn't in your app, say so in the recording.
- **Re-application** [Official]: a rejection means you must create a new app and reapply. You cannot re-apply on the same app.

### 4.3 In-app UX must-haves
- Display only the member data fields you showed in the screencast [Official, implied].
- No LinkedIn marks in the app branding [Official].

### 4.4 Common rejection reasons
- **[Official]**
  - Personal email.
  - Unverified organization, website or domain.
  - The app is not verified by the Page admin.
  - LinkedIn naming or logo in the app.
  - Incomplete form fields.
  - Restricted use case.
  - The screencast doesn't cover all declared use cases.
- **[Unverified]** Mixing products on the Community Management app is blocked by the UI rather than a rejection.

---

## 5. Google / YouTube (YouTube Data API v3 upload)

Scopes like `youtube.upload` / `youtube` are **sensitive** scopes. That means brand verification plus sensitive-scope verification is required for external production apps [Official general rule; scope classification Unverified in this session]. A YouTube API Compliance Audit is required for quota above the default.

### 5.1 Website must-haves
- **Homepage (Google brand verification)** [Official]. Source: https://support.google.com/cloud/answer/13464321
  - Hosted on a **verified domain you own**.
  - Accurately represents the app or brand.
  - Describes the app's functionality ("can not be only a login page").
  - **Links the privacy policy, and that link must be identical to the consent-screen link.**
- **Privacy policy** [Official]. Same source.
  - **Same domain as the homepage.**
  - Disclose how the app **accesses, uses, stores and shares Google user data**.
- **Domain ownership** [Official]: every authorized domain must be verified in **Google Search Console** by a project owner or editor.
- **Limited Use** [Official]: data from sensitive or restricted scopes may be used only for prominent user-facing features. No selling, ads or credit use, and limited human access.
  - Source: https://developers.google.com/terms/api-services-user-data-policy
  - Common practice is to add the statement: "Wrecking Social's use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements."
  - [Unverified: the exact required wording and placement was not on the fetched policy page. Reviewers commonly request it on the homepage or privacy policy.]
- **YouTube Developer Policies III.A**, required in your ToS and privacy policy [Official]. Source: https://developers.google.com/youtube/terms/developer-policies
  - **III.A.1:** "API Clients must display a link to YouTube's Terms of Service" (https://www.youtube.com/t/terms). Your ToS must state that users are bound by the YouTube Terms of Service.
  - **III.A.2:** users must agree to your privacy policy before using features. The policy must:
    - (a) be prominently displayed and accessible at all times;
    - (b) state that the app **uses YouTube API Services**;
    - (c) **reference and link to the Google Privacy Policy** (https://policies.google.com/privacy);
    - (d) explain what user information is accessed, collected, stored and used;
    - (e) explain how it is used, processed and shared;
    - (f) disclose third-party content or ads, if any;
    - (g) disclose cookies or device storage;
    - (h) explain that users can **revoke access via the Google security settings page** (https://security.google.com/settings/security/permissions);
    - (i) explain how to **contact you** with privacy questions or complaints.
- **Data retention** [Official]
  - Delete authorized data within 7 days of revocation via your app, and within 30 days after a Google security-page revocation (III.D.2).
  - Refresh or delete stored data every 30 days (III.E.4).
  - Honor deletion requests within 7 days.

### 5.2 Submission must-haves
- **OAuth consent screen** [Official]. Sources: https://support.google.com/cloud/answer/13464321, https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification
  - App name, support email, logo (JPEG/PNG/BMP, 1MB or less, representing the app; a new logo triggers re-verification), homepage URL, privacy URL, ToS URL (optional), authorized domains, and developer contact.
  - [Unverified: the 120x120 logo pixel spec.]
- **Demo video** [Official]: a publicly accessible or unlisted YouTube video showing:
  - the end-to-end flow including the OAuth grant;
  - the same app name and branding;
  - the **full consent screen in English** with the exact scopes, as the app's own client ID appears in the URL;
  - the features that use each scope.
- **Scope justification** [Official]: per scope, including why narrower scopes won't work.
- **YouTube API Compliance Audit / quota extension** [Official]. Source: https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits
  - Use the Audit and Quota Extension Form: business info, API client details and use case.
  - Reviewers may request accounts to review the production client (III.H).
  - The form also asks for legal entity details, demo credentials and screenshots of the privacy policy and OAuth flow [3rd-party: https://adaptlypost.com/blog/youtube-api-quota-extension].
- **Private-upload restriction**
  - Historically, uploads from unverified API projects created after 28 Jul 2020 were forced private until an audit.
  - The current videos.insert reference says "Videos uploaded from unverified API projects are not restricted to private viewing mode" (https://developers.google.com/youtube/v3/docs/videos/insert).
  - The restriction appears lifted in 2026, but the date is **unverified**.

### 5.3 In-app UX must-haves
Source: https://developers.google.com/youtube/terms/developer-policies unless noted.
- **Link to YouTube ToS displayed in the client**, for example on the YouTube connect and upload screen [III.A.1, Official]. The policy doesn't pin the exact screen; putting it on the upload screen is the safe reading.
- Users must agree to your privacy policy before accessing features [III.A.2, Official].
- **Users must have final control over the data published** to YouTube. Don't alter values without consent [III.C.3, Official].
- Write actions must be clearly identifiable as YouTube actions and **clearly initiated by the user** [III.C.2, Official].
- **Clearly identify the visibility settings** (public / unlisted / private) that will be set [III.E.3.f, Official].
- Have users **certify their content complies with YouTube Community Guidelines** before upload [Official guide: https://developers.google.com/youtube/terms/developer-policies-guide].
- Google Sign-in buttons must follow Google branding guidelines [Official].

### 5.4 Common rejection reasons
- **[Official]**
  - The homepage is only a login page.
  - The privacy policy is on a different domain, or not linked from the homepage.
  - The privacy link doesn't match the consent screen.
  - Domains are not verified in Search Console.
  - The demo video doesn't show the consent screen in English or the scope usage.
  - Scope justification is insufficient.
  - Over-broad scopes are requested.
- **[3rd-party / common]**
  - The privacy policy lacks the Google data and Limited Use disclosure.
  - The YouTube audit fails because the privacy policy is missing the YouTube API Services mention, the Google Privacy Policy link, the revoke link, or the YouTube ToS link.

---

## 6. Google Business Profile (GBP) APIs

### 6.1 Website must-haves
Source: https://developers.google.com/my-business/content/prereqs
- **[Official]** "A website that represents the business listed on the profile". It should match the website on the GBP listing.
- The same Google OAuth homepage, privacy and domain rules apply (§5.1), since the app uses the `business.manage` scope via OAuth [scope sensitivity Unverified].

### 6.2 Submission must-haves
Same source.
- **[Official]** You must manage a GBP that is "verified and active for 60+ days". For example, Wrecking Social's own Chicago listing.
- **[Official]** Apply from an email address listed as an owner or manager on that GBP.
- **[Official]** Provide the Google Cloud **project number** (not the project ID).
- **[Official]** Submit through the GBP API contact form and choose "Application for Basic API Access". The legacy Google Form is closed.
- **[Official]** Approval check: quota 0 QPM means not approved; 300 QPM means approved. Review takes up to about 2 weeks.

### 6.3 In-app UX
- No GBP-specific UX rules were found [Unverified]. Google OAuth branding rules apply.

### 6.4 Common rejection reasons
- The GBP is under 60 days old or unverified.
- The applicant email isn't an owner or manager.
- The website doesn't match the GBP.
- The project number is wrong or missing [3rd-party for the project-number item].

---

## 7. X (Twitter) developer app

Since Feb 2026, new accounts use pay-per-use credits [3rd-party/Official pricing page: https://docs.x.com/x-api/getting-started/pricing]. There is no formal App Review, but the developer agreement and policies still apply.

### 7.1 Website must-haves
- **Website URL** is a required App-info field in User authentication settings, alongside callback URIs and app permissions/type [3rd-party: https://docs.cdp.coinbase.com/wallets/authentication/social-login/x].
- Optional Terms of Service and Privacy Policy URLs [Unverified that they are optional; recommended].
- A privacy policy covering X data is expected under the Developer Policy and the Controller-to-Controller DPA (§XIV.E) [Official agreement: https://docs.x.com/developer-terms/agreement].

### 7.2 Submission must-haves
- A developer account use-case description.
- Callback URLs: exact match, HTTPS [Official: https://docs.x.com/fundamentals/developer-apps].
- **Critical licensing issue** [Official text]: the Developer Agreement §III.A(e) prohibits providing "use of the X API on a service bureau, rental or managed services basis", and §III.A(d) prohibits selling or sublicensing.
  - A 2026 compliance article reads this as barring a SaaS from posting for all its customers through one shared X app, and recommends "Bring Your Own App" (each customer registers their own X app) or a separate written arrangement with X [3rd-party interpretation: https://ayrshare.com/blog/x-api-compliance-byo-app/].
  - **Get legal review before launching X posting on a shared app.**

### 7.3 In-app UX must-haves
- **Express, informed consent** before acting on a user's behalf. Authentication alone is not consent [Official policy: https://developer.x.com/overview/terms/policy].
- Automation Rules: clearly describe the automated actions, get express consent, and re-obtain consent if the functionality changes materially. No mass duplicate posting and no spam. Source: https://help.x.com/en/rules-and-policies/x-automation

### 7.4 Common rejection / enforcement reasons
- Service-bureau or shared-credential use.
- Duplicate or spam posting.
- Automation without consent.
- Restricted use cases (https://docs.x.com/developer-terms/restricted-use-cases).
- There is reportedly no formal appeal path [3rd-party].

---

## 8. Pinterest (Trial → Standard access)

### 8.1 Website must-haves
- **[Official]** A privacy policy that "load[s] fully and [is] publicly accessible, on a domain tied to your company or app". It must be accurate. Source: https://developers.pinterest.com/docs/key-concepts/access-tiers/
- **[Official]** The policy must be "consistent with all applicable laws". Source: https://policy.pinterest.com/en/developer-guidelines
- **[3rd-party]** The privacy URL should be on the same domain as the website URL. It must be an actual policy page, not the homepage. It should describe how Pinterest data is collected, used, stored and protected. Source: https://community.pinterest.biz/t/standard-access-walkthrough-a-step-by-step-guide/52518

### 8.2 Submission must-haves
- **[Official]** Trial: a thorough app description and use case, plus the privacy policy link. Vague descriptions are denied.
- **[Official]** Standard: requires Trial approval plus a **demo video** that must:
  - include "the user authentication flow" (OAuth), even if you're the only user;
  - show how Pinterest is integrated.
  - "Wireframes or general platform demos ... may be denied."
- **[3rd-party]** The video should show: user starts the connection → Pinterest authorize screen → return to the redirect URI → a live API action (create a Pin) → user value. The redirect URI must match exactly.

### 8.3 In-app UX must-haves
Source: https://policy.pinterest.com/en/developer-guidelines
- **[Official]** For scheduling apps, **"the end user must choose each Pin to be published"**. No auto-pinning without the user specifically considering each action.
- **[Official]** No actions without "specific knowledge and consent".
- **[Official]** OAuth only; never collect Pinterest credentials or cookies.
- **[Official]** Don't store API data beyond what's allowed. Don't share or sell it.
- **[Official]** Don't misrepresent your relationship with Pinterest or imitate its UI.

### 8.4 Common rejection reasons
- **[Official]**
  - Inaccurate or inaccessible privacy policy.
  - Unclear description.
  - Demo missing the OAuth flow.
  - No live integration.
  - Unapproved auth method.
- **[3rd-party]** Privacy URL points to a landing page; domain mismatch.

---

## 9. Reddit (Data API)

### 9.1 Status
- Since **Nov 2025**, Reddit requires **approval for all new OAuth tokens/apps** under the **Responsible Builder Policy**. Self-service app creation is closed [3rd-party mirror of the r/redditdev announcement: https://r.datuan.dev/r/redditdev/comments/1oug31u/introducing_the_responsible_builder_policy_new/nocca6t].
- Commercial use (any business or monetized product, which includes a paid SaaS scheduler) reportedly requires **written approval and a contract**.
- Sources [3rd-party]:
  - https://www.redditapis.com/blogs/reddit-api-commercial-use-licensing-explained-2026
  - https://www.activepieces.com/blog/reddit-api-access-in-2026-how-to-get-started.md
- The official Reddit Data API Wiki (https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki) returned 403 to my fetch. **The details below are unverified against Reddit's own text.**

### 9.2 Website and submission must-haves
All [Unverified/3rd-party]:
- Submit Reddit's developer request form (Reddit Help → "I'm a Developer" → register to use the API). Describe:
  - the app;
  - the subreddits involved;
  - the actions needed (submit posts);
  - commercial status.
- Expect routing to a commercial contract.
- A public website and privacy policy are reasonable to have ready.
- A descriptive User-Agent is required by the Data API rules.

### 9.3 In-app UX
- Users must authorize via OAuth.
- Respect subreddit rules.
- No spam or automated mass posting [Unverified].

### 9.4 Common rejection reasons
- "Not in compliance with Reddit's Responsible Builder Policy and/or lacks necessary details" [3rd-party quote of a Reddit Support reply].
- Third-party apps generating tokens for other users have reportedly been declined.
- **Risk:** Reddit approval for a commercial multi-tenant scheduler is uncertain.

---

## 10. Consolidated WEBSITE checklist for wreckingsocial.com

### A. Homepage (public, no login wall)
- [ ] It is a real, fully developed marketing homepage, not just a login or landing page. It describes what Wrecking Social does: scheduling and publishing posts to Facebook, Instagram, Threads, TikTok, LinkedIn, YouTube, Pinterest, X, Reddit and Google Business Profile on behalf of business customers. (TikTok, Google)
- [ ] It shows the legal business name, for example "Wrecking Social LLC" or whatever the exact registered name is, plus the Chicago business address and phone. These must match the Business Verification documents and LinkedIn org data. (Meta BV, LinkedIn)
- [ ] **Footer links visible without opening a menu:** Privacy Policy, Terms of Service, Data Deletion, Contact. (TikTok requires no menu; Google requires the privacy link on the homepage)
- [ ] Served over HTTPS on wreckingsocial.com, publicly reachable, not geo-blocked, and crawlable (no bot-blocking of the facebookexternalhit, Googlebot or TikTok crawlers). (Meta, Google)
- [ ] The app name and logo are consistent everywhere: website, all developer consoles, OAuth screens and demo videos. They contain no platform names or marks: no "Linked"/"In", "TikTok", "Facebook"/"Insta" or "YouTube" in the name or logo. (TikTok, LinkedIn, Meta icon, Google demo-branding match)
- [ ] Google Sign-in / "Connect" buttons follow each platform's brand guidelines. (Google)

### B. Domain and email
- [ ] wreckingsocial.com is verified in **Google Search Console** (Google), **TikTok URL/domain verification** (website, ToS, privacy URLs, plus the media/CDN URL prefix used for `PULL_FROM_URL`), and the **Meta Business Manager domain** (recommended for BV).
- [ ] A domain email such as dev@ or privacy@wreckingsocial.com is used for all developer accounts. Personal email fails LinkedIn and weakens Meta BV.
- [ ] A LinkedIn Company Page exists for Wrecking Social, and a super admin verifies the LinkedIn developer app.
- [ ] A verified Google Business Profile has been active for 60+ days, with its website set to wreckingsocial.com. (GBP API)

### C. Privacy Policy (one page on wreckingsocial.com, clearly titled "Privacy Policy")
- [ ] The page is our own policy, publicly accessible, HTML, with a stable URL. The same URL is used on the homepage, the Google consent screen and every developer console.
- [ ] Who we are: legal entity, address and **privacy contact email**. (Meta, YouTube III.A.2.i)
- [ ] **Per-platform data sections**: what we collect from each platform. Covers:
  - Facebook Pages, Instagram, Threads, TikTok, LinkedIn, YouTube/Google, Pinterest, X, Reddit and GBP;
  - account IDs, names, profile images, OAuth tokens, Page lists, post content and media, analytics, comments;
  - why each is needed, how it is used, where it is stored, who it is shared with (sub-processors, hosting), and how long it is retained. (Meta, Google, Pinterest, LinkedIn, TikTok [3rd-party])
- [ ] Automatically collected data: logs, cookies and device storage. (Meta; YouTube III.A.2.g)
- [ ] **Data deletion**: how users request deletion (email or form), the timeline (7 days for YouTube requests), and token revocation on disconnect. Covers Meta's deletion explanation, YouTube III.D/III.E deletion and 30-day refresh, and LinkedIn data storage rules.
- [ ] **YouTube-specific language**:
  - "Wrecking Social uses YouTube API Services."
  - A link to the **Google Privacy Policy** (https://policies.google.com/privacy).
  - A note that users can revoke access at **https://security.google.com/settings/security/permissions**.
  - (YouTube III.A.2.b/c/h)
- [ ] **Google Limited Use statement**: "Wrecking Social's use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements." It links to https://developers.google.com/terms/api-services-user-data-policy. [Exact wording customary, not re-verified]
- [ ] The policy states that Google, Meta, TikTok, LinkedIn and other platform data is **not sold, not used for advertising, and not used to train AI models** (or, if it is, disclose that and obtain consent). (Google Limited Use, Reddit, Pinterest)
- [ ] Third-party ads and content disclosure, if applicable. (YouTube III.A.2.f)
- [ ] A last-updated date and a change-notification commitment. (Google requires re-consent for new data uses)

### D. Terms of Service
- [ ] A Terms of Service page on wreckingsocial.com, visible in the footer. (TikTok requires it; Meta and Google list it as an optional field)
- [ ] **A clause binding users to the YouTube Terms of Service, with a link to https://www.youtube.com/t/terms.** (YouTube III.A.1)
- [ ] Clauses requiring users to comply with each connected platform's terms, for example TikTok's Music Usage Confirmation and Branded Content Policy, X Rules and Automation Rules, Pinterest, LinkedIn and Meta terms.
- [ ] A user-consent clause: users authorize Wrecking Social to publish the content they schedule on their behalf, and only what they choose. (X express consent; Pinterest "end user must choose each Pin")

### E. Data deletion page and endpoints
- [ ] A public **Data Deletion Instructions** page, for example /data-deletion, with step-by-step instructions to disconnect each channel, delete the account, and email for deletion. Usable as Meta's Data Deletion Instructions URL.
- [ ] Or, better, a **Meta data-deletion callback** (HTTPS, parses `signed_request`, returns `{url, confirmation_code}`) plus a human-readable **deletion status page**. (Meta)
- [ ] A Meta/Threads **Deauthorize callback URL** and **Data Deletion Requests URL** for the Threads use case. (Threads)

### F. Contact / About
- [ ] A Contact page with a business email, a physical Chicago address and a phone number matching BV documents. (Meta BV, LinkedIn, YouTube III.A.2.i)

### G. Reviewer and demo assets (not on the site, but prepared from it)
- [ ] Screencasts recorded on the **production domain**, in English, at 1080p, showing the full OAuth/consent flow from logged-out through to a real published post on each platform. (Meta, TikTok domain match, Google English consent screen, LinkedIn downloadable plus narration, Pinterest)
- [ ] Reviewer test logins for Wrecking Social, with an active plan/trial that has posting unlocked, given free of charge. (Meta, TikTok, LinkedIn Standard, YouTube audit)
- [ ] App icons: Meta 1024x1024; Google 1MB or less JPG/PNG/BMP; no platform marks.

### H. In-app UX items reviewers will check (summary)
- [ ] **TikTok:**
  - Creator nickname shown.
  - Privacy dropdown with no default.
  - Comment/Duet/Stitch unchecked by default, and disabled when the creator has them off.
  - Commercial disclosure toggle off by default, with the exact labels.
  - The Music Usage / Branded Content declaration above Publish.
  - Editable caption.
  - No added watermark or branding.
  - Preview.
  - Processing-time notice.
- [ ] **YouTube:**
  - A YouTube ToS link on the YouTube connect/upload UI.
  - Visible privacy-status selection.
  - The user initiates and controls every upload.
  - Community Guidelines certification.
- [ ] **Pinterest:** the user selects each Pin, with no autopilot.
- [ ] **X:** clear disclosure of automated posting plus express consent.
- [ ] **Meta:** a findable, working "Connect Facebook / Instagram" flow and Page/account selection.
- [ ] **LinkedIn:** shows comments and commenter fields exactly as described in the screencast.

### Biggest business risks found
1. **X**: the shared-app SaaS model may conflict with the Developer Agreement's "service bureau" prohibition (§III.A(e)). Consider BYO-app or get X's written approval.
2. **Reddit**: commercial schedulers need explicit approval and likely a paid contract. Approval is uncertain.
3. **LinkedIn Community Management**: a rejection is final for that app, so prepare everything before applying.
4. **TikTok**: the UX audit is strict. Verify that the Postiz TikTok provider UI implements every Direct Post rule (see Postiz issue #1362 for prior gaps).
