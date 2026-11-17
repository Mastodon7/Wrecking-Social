# Deploying Wrecking Social on Coolify

This puts the app on your server through Coolify, built from this GitHub repo.
It uses `docker-compose.coolify.yml`. That file runs seven containers: the app,
its database (Postgres), Redis, and the Temporal stack that publishes scheduled
posts (Temporal, its own Postgres and Elasticsearch).

Start on a test address (`app.wreckingsocial.com`), check it works, then move it
to `wreckingsocial.com` (step 8).

**Where the app is built:** not on the server. Building the app needs about
4 GB of memory, and doing that on the production VPS froze every app on it.
GitHub Actions builds the image on each push to `main`
(`.github/workflows/docker-image.yml`) and pushes it to
`ghcr.io/mastodon7/wrecking-social`. Coolify only pulls and runs it. Running
everything needs about 3 GB.

## 1. Let Coolify read the repo

Coolify reads private repos through its GitHub App, the same way your other
apps deploy.

1. Go to **github.com/settings/installations**.
2. Next to the Coolify app, click **Configure**.
3. Add `Wrecking-Social` under **Repository access**, then **Save**.

## 1b. Let the server pull the image

The image is private, so the server needs a GitHub token that can only read
packages.

1. GitHub → **Settings → Developer settings → Personal access tokens →
   Tokens (classic)** → **Generate new token (classic)**. Name it
   `coolify-ghcr-read`, tick only **read:packages**, and generate it.
2. Log the server in to ghcr.io with your GitHub username and that token, for
   example in Coolify → **Servers → localhost → Terminal**:
   `docker login ghcr.io -u <github-username>` and paste the token when asked.
   (On Coolify versions with **Servers → localhost → Registries**, add
   `ghcr.io` there instead.)
3. Check the **Docker image** workflow has run on `main` (GitHub → **Actions**)
   before the first deploy, or the pull fails.

## 2. Point the test address at the server

At your DNS provider for wreckingsocial.com, add:

| Type | Name | Value |
|---|---|---|
| A | `app` | `162.222.203.203` |

## 3. Create the resource

1. Coolify → **Projects** → **Wrecking Social** → **+ New** (resource).
2. Choose **Private Repository (with GitHub App)** and pick the Coolify GitHub App.
3. Repository: **Mastodon7/Wrecking-Social**. Branch: **main** (merge pull request #1 first).
4. Build pack: **Docker Compose**.
5. Base directory: `/`. Docker Compose location: `/docker-compose.coolify.yml`.
6. Click **Continue** / **Load Compose File**.

## 4. Set the domain

In the resource's **General** tab, find the **app** service and set its domain to:

```
https://app.wreckingsocial.com:5000
```

The `:5000` tells Coolify which port inside the container to send visitors to.
Visitors still use the normal `https://app.wreckingsocial.com`. Leave every
other service without a domain, because they must not be public.

## 5. Fill in the environment variables

**Environment Variables** tab:

| Variable | Value |
|---|---|
| `APP_URL` | `https://app.wreckingsocial.com` (no slash at the end) |
| `ENCRYPTION_KEY` | Run `openssl rand -base64 32` on any computer and paste the result. **Save a copy in your password manager.** If it's lost, every connected channel must be reconnected. |
| `EMAIL_PROVIDER` | `resend` (recommended) |
| `RESEND_API_KEY` | from resend.com, after you verify wreckingsocial.com there |
| `EMAIL_FROM_ADDRESS` | for example `hello@wreckingsocial.com` |

Coolify creates the database passwords and the login secret by itself
(`SERVICE_PASSWORD_*`, `SERVICE_BASE64_*`). Leave those as they are.

Without email settings, new accounts are activated right away, with no
confirmation email and no password-reset emails. That's OK for a first test,
but set email up before customers sign up.

The social platform keys (`FACEBOOK_APP_ID`, `TIKTOK_CLIENT_ID`, ...) stay
empty until each platform approves the app. Add them later and redeploy.

## 6. Deploy

Wait for the **Docker image** workflow on GitHub to finish (about 15 to 25
minutes the first time), then click **Deploy** in Coolify. The deploy only
pulls the image and starts the containers. Follow it in **Deployments → logs**.
Later pushes to `main` build a new image, and the workflow then asks Coolify to
redeploy (see "Automatic deploys" below).

### Automatic deploys

Coolify's own **Deploy on push** must stay off for this app (**Advanced →
Auto deploy → Manual deployments only**): it fires the moment you push, before
GitHub has built the new image, so it just restarts the old one. Instead the
**Docker image** workflow calls Coolify's deploy webhook after the image is
pushed. It needs one secret:

1. Coolify → **Keys & Tokens → API tokens → New Token**. Name it
   `github-wrecking-social-deploy` and give it only the **deploy** permission.
   Copy the token (Coolify shows it once).
2. GitHub → the repo → **Settings → Secrets and variables → Actions → New
   repository secret**. Name `COOLIFY_TOKEN`, paste the token, **Add secret**.

Without the secret the workflow still builds the image and shows a warning;
click **Redeploy** in Coolify by hand. When the app container says it's listening, open
https://app.wreckingsocial.com.

## 7. Check it

1. https://app.wreckingsocial.com shows the Wrecking Social homepage.
2. `/privacy`, `/terms`, `/data-deletion` and `/contact` open without signing in.
3. **Get started** → create your own account → you land in the calendar.
4. Schedule a test post a few minutes ahead to a channel that needs no review
   (for example Bluesky or Mastodon) and confirm it goes out.

Create your own account before you share the address with anyone.

## 8. Move to wreckingsocial.com

When the test works:

1. Find what serves the old demo page at wreckingsocial.com today (it's on this
   server, behind nginx), and stop it or remove its domain.
2. Make sure DNS has `A @ 162.222.203.203` (and `www` if you want it).
3. In the resource: set the app domain to
   `https://wreckingsocial.com:5000,https://www.wreckingsocial.com:5000`, and
   set `APP_URL` to `https://wreckingsocial.com`.
4. Redeploy.

Platform reviewers check the real domain, so do this before you submit any
platform application. Then use these URLs in every developer console:

| Field | URL |
|---|---|
| Homepage | `https://wreckingsocial.com` |
| Privacy Policy | `https://wreckingsocial.com/privacy` |
| Terms of Service | `https://wreckingsocial.com/terms` |
| Data deletion instructions | `https://wreckingsocial.com/data-deletion` |
| OAuth redirect (per platform) | `https://wreckingsocial.com/integrations/social/<platform>` |

## Backups

The data lives in Docker volumes on the server: `wrecking-postgres` (accounts,
posts, channels), `wrecking-uploads` (media) and `temporal-postgresql`
(scheduled jobs). Turn on Coolify's scheduled backups for the Postgres database,
or back up those volumes.
