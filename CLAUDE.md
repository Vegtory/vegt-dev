# vegt.dev

The personal site of William van der Vegt. Astro + Tailwind, statically built,
served from Cloudflare. Content is markdown, edited by hand or by AI — there is
no CMS.

## Layout

```
src/
  content/            the editable content
    sections/         homepage sections (frontmatter = props, body = prose)
    blog/             blog posts
    gallery/          photo albums
  content.config.ts   zod schemas — READ THIS BEFORE EDITING FRONTMATTER
  pages/              routes (incl. /now and a 404 built from a failed print)
  components/         this site's components; yours to change freely
  layouts/            BaseLayout, BlogLayout
  assets/             images
  site.ts             site-wide settings (name, lang, nav, analytics id)
  buildInfo.ts        rev / commit / build time — the footer's metadata is real
astro-template/       submodule: shared components, imported as @template/*
contact-worker/       Cloudflare Worker serving /api/contact
```

## Editing content

**Read `src/content.config.ts` first.** It is the schema, and therefore the list
of fields that actually exist. A field not in the schema is silently dropped by
zod; a missing required field is a build error naming the file.

- **Homepage copy** → `src/content/sections/*.mdx`. Frontmatter becomes the
  component's props, the markdown body becomes its default slot. The `type` key
  picks which component renders the file and which fields are legal.
- **Homepage structure** (order, which sections exist) → `src/pages/index.astro`.
  It imports and composes sections explicitly. To add one, add an `.mdx` file, a
  variant to the `sections` union in `content.config.ts`, and a line to the page.
- **Blog post** → add an `.mdx` file to `src/content/blog/`. The filename,
  lowercased, becomes the URL. **These URLs are indexed — renaming a file breaks
  a live link.** Set `ishidden: true` to keep a draft out of the build entirely.
- **Photo album** → add a markdown file to `src/content/gallery/` *and* a folder
  of the same name under `src/assets/gallery/`. The photos are not listed in
  frontmatter; they are whatever is in that folder. If the two names diverge the
  album renders empty rather than failing, so double-check.

Images in frontmatter go through Astro's `image()` helper, so paths are relative
to the markdown file (`../../assets/foo.png`) and a typo fails the build. Images
inside an MDX body use `<MdxCustomPicture image="..." />` with a plain string
path, resolved by filename.

## Components

`src/components/` is this site's own. Change anything in it freely.

`astro-template/` is a shared library, consumed as a submodule. Import from it
when a component fits as-is:

```astro
import Hero from "@template/Hero.astro";
```

The moment you want it different, copy it and own it:

```bash
cp astro-template/astro/components/Hero.astro src/components/
```

then change that import to `@ui/Hero.astro`. Nothing inside the copied file
needs editing. **Do not edit files inside `astro-template/` to change how this
site looks** — that is a shared repo, and the change would land on every site
using it. Copy instead.

Keep the provenance stamp at the top of a copied file up to date, and set
`@modified: true` once you edit it. `pnpm check:template` uses those stamps to
report which copies have upstream fixes available; see
`astro-template/docs/updating.md`.

## Styling

The look is a **technical field journal**: warm paper (`bg-background`),
near-black type, hairline rules, near-square corners, and saturated colour used
the way it turns up on a workbench — a highlighter stripe, a registration mark,
an LED. Read the header comment in `tailwind.config.cjs`; it is the design
rationale, not just a token list.

Surfaces are `background` / `surface` / `surfaceMuted`, separated by `hairline`
(and `hairlineStrong` for a rule that should read as drawn). Text is
`primaryText` / `mutedText` / `noteText`.

The five mark colours — `cobalt`, `tomato`, `acid`, `violet`, `amber` — each
have three members, and the split is load-bearing:

- `bg-cobalt` etc. is the **mark**: rules, dots, fills. Never type.
- `text-cobalt-ink` etc. is the **only** member that may set type. Each clears
  4.5:1 on `surfaceMuted`, the darkest surface they land on.
- `bg-cobalt-wash` is a tint to put type on top of.

`acid` and `amber` are below 3:1 as marks and are flagged DECORATIVE ONLY in
the config — they must never be the sole carrier of meaning. This is why a
topic's label is always ink and only the pad beside it is coloured.

There is deliberately **no per-section colour scheme**. Assigning one hue per
section is the SaaS-landing-page move this design exists to avoid.

Never hardcode a hex value, and never build a class name by string
concatenation: Tailwind only sees complete literals.

### The five verbs

`src/components/topics.ts` holds the site's vocabulary — bouwen, knutselen,
schrijven, fotograferen, vertellen — with each one's label and mark colour.
Section headings, blog tags and the topic strip all read from it, which is what
makes cloud work land as one part of the picture rather than as the identity.
A blog post opts in with `topic:` in its frontmatter.

### Motion

All motion is ambient — nothing has to run for the page to be understood. Reach
for it through `motion-safe:` **always**, never bare. `prefers-reduced-motion:
reduce` currently leaves the site with zero running animations and nothing
hidden; keep it that way.

## Commands

```bash
pnpm dev             # localhost:8080
pnpm build           # static build to dist/
pnpm check           # astro check (typecheck) - run before committing
pnpm check:template  # which copied components have upstream updates
pnpm dev:worker      # wrangler dev, the only way to test /api/contact
pnpm run deploy      # astro build && wrangler deploy
```

> **`pnpm run deploy`, never `pnpm deploy`.** `deploy` is a built-in pnpm
> command for deploying a package out of a workspace, and it shadows the
> script — `pnpm deploy` will fail rather than deploy the site.

> `pnpm dev` does **not** serve `/api/contact`. That route belongs to the
> Worker, so the contact form only works under `pnpm dev:worker`. This is the
> most likely reason for "the contact form is broken".

## Things that will bite

- **`.slug` does not exist.** Content Layer entries have `.id`. Likewise, render
  with the top-level `render(entry)`, not `entry.render()`.
- **Dates are `Date` objects**, coerced by the schema. Do not wrap them in
  `new Date(...)` or cast them to string.
- **The gallery is heavy.** A full build generates ~700 image variants and takes
  about 40 seconds. AVIF is deliberately not generated — its encoder is slow
  enough to have blown a build time limit.
- **Source images need roughly 3x the pixels they are displayed at.** Phones
  are DPR 2-3, so a photo shown in a 256px slot wants a ~768px original.
  `CustomPicture` generates variants at 240/480/720/960 plus the source's own
  width, and it never upscales — hand it a 400px file and 400px is all any
  screen gets, however large the slot.

  **Two assets are currently the limiting factor on the design**, and both are
  a drop-in fix:
  - `src/assets/image.jpeg` (hero portrait) is 400x400, and the subject fills
    93% x 97% of it, so there is no margin to crop and nothing to reclaim. The
    hero stretches it about 1.25x at `lg` — which a blended black-and-white
    figure carries and a crisp framed photo would not — and downscales it on
    phone and tablet. A ~1400px version on the same white backdrop opens the
    hero up to the full reference proportions: one constant and one `sizes`
    string, both named in `Hero.astro`'s header comment.
  - `src/assets/speaking-nimma-codes.jpg` is 356x200. `SpeakingFeature` is
    drawn for a near-full-bleed photograph but caps the frame at `max-w-2xl`
    for the same reason. A ~1600px original lets it run full width.

- **The hero portrait is a CSS cut-out, and it is fragile in one specific way.**
  There is no transparent PNG: the studio photo has a pure white backdrop and
  is composited with `mix-blend-mode: multiply`, so white becomes paper and the
  figure stays. An element only blends with the backdrop inside the nearest
  *isolating* ancestor, so a `z-index`, a `transform`, an `opacity` below 1, a
  `filter` or a `will-change` **anywhere above the image** silently turns the
  cut-out back into a plain white box. That is why the hero layers with DOM
  order alone and carries no `z-index` at all, why the figure has no entrance
  animation, and why it passes `showPlaceholder={false}` to `CustomPicture`.
  The full explanation is in `Hero.astro`'s header comment — read it before
  restructuring that section.

- **`TextRender` treats `_x_` as markdown emphasis.** Anything passed through it
  that contains underscores gets mangled — `works_on_my_machine` came out as
  `works<i>on</i>my_machine`. Identifiers (status chips, package-style tags)
  are therefore rendered literally, not through `TextRender`.

- **The gallery JPEGs have no EXIF.** They were exported stripped, so there is
  no shutter speed or aperture to read out of them. Photo captions carry place
  and date only; do not write plausible-looking camera settings under a
  photograph, because they would be fiction.
- **`PhotoCollage` reshuffles on every build.** The homepage collage picks four
  random gallery photos at build time, so consecutive deploys differ.
