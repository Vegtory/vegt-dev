# vegt.dev

Personal site of William van der Vegt. Astro + Tailwind, statically built,
served from Cloudflare Workers.

## Setup

```bash
git clone --recurse-submodules https://github.com/Vegtory/vegt-dev.git
cd vegt-dev
pnpm install
pnpm dev            # localhost:8080
```

If you cloned without `--recurse-submodules`:

```bash
git submodule update --init
```

## Commands

| | |
|---|---|
| `pnpm dev` | dev server on :8080 |
| `pnpm build` | static build into `dist/` (~40s; the gallery is the long pole) |
| `pnpm check` | typecheck |
| `pnpm check:template` | which copied components have upstream updates |
| `pnpm dev:worker` | `wrangler dev` — the only way to exercise `/api/contact` |
| `pnpm run deploy` | `astro build && wrangler deploy` (the `run` is required — see below) |
| `pnpm preview:upload` | `astro build && wrangler versions upload` — a preview URL, no deploy |

`pnpm dev` does not serve `/api/contact`; that route belongs to the Worker.

## Editing content

Everything editable is markdown under `src/content/`, described by the zod
schemas in `src/content.config.ts`. See [CLAUDE.md](CLAUDE.md) for the details —
it is written for both people and AI agents.

## Deploying

Deployment is `wrangler` directly. The built site is served from Cloudflare's
asset store; only `/api/contact` invokes the Worker.

Set the environment once:

```bash
export CLOUDFLARE_ACCOUNT_ID=...
wrangler secret put SMTP_PASSWORD                      # production
wrangler preview base-config secret put SMTP_PASSWORD  # Previews Base
```

The password is the only secret. Everything else the contact Worker reads
(`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `INFO_EMAIL`, `INFO_NAME`,
`CORS_ORIGINS`) lives in `wrangler.jsonc`, once under `vars` for production and
again under `previews.vars` for Previews Base, which does not inherit the top
level. For local Worker development, put `SMTP_PASSWORD=...` in a gitignored
`.dev.vars`.

Use a Zoho app-specific password rather than the account password.

Then:

```bash
pnpm run deploy
```

`pnpm deploy` without `run` will **not** work: `deploy` is a built-in pnpm
command for deploying a package out of a workspace, and it shadows the script.
Always write `pnpm run deploy`.

### Preview URLs

Every version uploaded to Cloudflare gets its own URL, so a change can be looked
at on real infrastructure before it becomes the site:

```bash
pnpm preview:upload                               # build, upload, print the URL
wrangler versions upload --preview-alias branch   # ...and pin a readable one
```

The URL is `<version-prefix>-vegt.<subdomain>.workers.dev`, or
`<alias>-vegt.<subdomain>.workers.dev` for the aliased form. Uploading a version
does not deploy it: production keeps serving whatever it was serving.

`preview_urls: true` in `wrangler.jsonc` is what keeps this on. The setting
inherits `workers_dev` when it is absent, and `workers_dev` is itself on by
default, so previews worked before the key existed — but only by accident, and a
toggle flipped in the dashboard reverts on the next deploy unless the file says
otherwise.

Two things to know before sharing one:

- **A preview URL is public.** Anyone holding it can read an unreleased version.
  [Cloudflare Access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)
  is the way to put a login in front of it.
- **The contact form works on a preview**, and sends real mail. The Worker
  always accepts a post from its own origin, which is what lets a preview's
  hostname through without being listed in `CORS_ORIGINS`; any other origin
  not on that list still gets a 403.

There is no infrastructure-as-code in the repo. DNS and any storage buckets are
managed in the Cloudflare dashboard, or with `wrangler` directly — for example
`wrangler r2 bucket create <name>`. A CDKTF stack used to live here; it created
a single unused R2 bucket, and CDKTF itself was deprecated in December 2025.

## Structure

The shared component library lives in the `astro-template` submodule. Import a
component from `@template/` to use it as-is, or copy it into `src/components/`
and own it. See [astro-template/README.md](astro-template/README.md).
