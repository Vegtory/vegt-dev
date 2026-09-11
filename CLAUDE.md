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

The look is a **technical field journal printed on silver**: cool light grey
stock (`bg-background`), near-black type, hairline rules, near-square corners,
and saturated colour used the way it turns up on a workbench — a highlighter
stripe, a registration mark, an LED. Read the header comment in
`tailwind.config.cjs`; it is the design rationale, not just a token list.

The neutral is cool on purpose. It was warm paper until the hero gained its
ambient washes, and warm paper under a warm wash reads as one muddy cream; a
silver ground is what lets the peach register as light falling on the page
rather than as the page's own colour.

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

### Typography, and the one webfont

Body, headings and metadata are **system stacks** — no webfont, no network cost,
no layout shift. That is deliberate: the About copy links to the site's own
PageSpeed score, so a render-blocking font on the body text would undercut the
one claim the page makes.

`font-hand` is the single exception: **Caveat**, for the pencilled annotations
(`Annotation.astro`) and the hero's opening line. It is self-hosted from
`public/fonts`, subset to Latin plus the accents and punctuation Dutch uses, and
built **without the `calt`/`liga` tables** — in a handwriting face those carry a
pile of connecting alternates, and dropping them took the file from 48 kB to
18 kB with no visible difference (the two were compared side by side).

It is preloaded in `BaseLayout` and set `font-display: swap`, which measures
0.000 CLS even on a throttled 400 kbps link. **The preload and the `@font-face`
belong together** — a preload with no matching rule downloads a file nothing
uses, and a `@font-face` with no preload is discovered only after the CSS
parses, which is too late for text above the fold. `crossorigin` is required on
a font preload even same-origin, or the browser fetches it twice.

Never put `font-hand` on body copy. It is a display face; at paragraph length it
is slower to read than the sans. Set it larger than the surrounding text when
you do use it — Caveat has a small x-height, and at body size a script face
stops being informal and starts being a squint.

The font ships with its SIL Open Font License at
`public/fonts/Caveat-OFL.txt`; keep that file alongside it.

### Ambient washes

`AmbientWash.astro` is soft colour drifting behind a section — the hero at
`strong`, the speaking section and footer at `faint`. Three rules keep it from
becoming a gradient background: it is always behind something, it never carries
meaning or sits under body copy at strength, and it moves on a scale of minutes
(83s / 107s / 131s, transform-only, behind `motion-safe:`).

It also **tints the hero portrait**, deliberately — the cut-out is a `multiply`
composite, so it takes the colour of whatever is behind it. Keep the washes
light: a darker wash makes a darker figure and a saturated one makes a stained
one.

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
  - `src/assets/portrait-bw.jpg` (hero portrait) is 400x400, and the subject
    fills 97% x 96% of it, so there is no margin to crop and nothing to
    reclaim. The
    hero stretches it about 1.25x at `lg` — which a blended black-and-white
    figure carries and a crisp framed photo would not — and downscales it on
    phone and tablet. A ~1400px version on the same white backdrop opens the
    hero up to the full reference proportions: one constant and one `sizes`
    string, both named in `Hero.astro`'s header comment.
  - `src/assets/speaking-nimma-codes.jpg` is 356x200. `SpeakingFeature` is
    drawn for a near-full-bleed photograph but caps the frame at `max-w-2xl`
    for the same reason. A ~1600px original lets it run full width.

- **The hero portrait is a CSS cut-out, and it is fragile in one specific way.**
  There is no transparent PNG: the studio photo has a white backdrop and is
  composited with `mix-blend-mode: multiply`, so white becomes page and the
  figure stays. **The backdrop must be white, not merely light** — the delivered
  portrait had a vertical lighting gradient from 231 to 251 and rendered as a
  visible grey box, and the light polo shirt overlaps that same range so no
  threshold separates them. It was fixed with a flat-field correction (per-row
  median of the outer ten columns as the background level, scaled to 255);
  `Hero.astro`'s header comment has the full recipe, which is worth repeating
  on any replacement photo. An element only blends with the backdrop inside the nearest
  *isolating* ancestor, so a `z-index`, a `transform`, an `opacity` below 1, a
  `filter` or a `will-change` **anywhere above the image** silently turns the
  cut-out back into a plain white box. That is why the hero layers with DOM
  order alone and carries no `z-index` at all, why the figure has no entrance
  animation, and why it passes `showPlaceholder={false}` to `CustomPicture`.
  The full explanation is in `Hero.astro`'s header comment — read it before
  restructuring that section.

- **Tailwind emits nothing for an off-scale opacity modifier.** `bg-amber/26`
  produces no rule at all — no warning, no build error, the class just lands in
  the HTML and the element renders fully transparent. Only values on the
  opacity scale work bare (5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95,
  100); anything else must be bracketed: `bg-amber/[0.26]`. Two of the three
  hero washes and two of the four layers in the 404 illustration were invisible
  for exactly this reason.

- **`motion-safe:` belongs on the `animate-*` class itself.** A bare
  `animate-wash-a` keeps running under `prefers-reduced-motion: reduce`, and
  pairing it with a `motion-safe:[animation-play-state:running]` utility fixes
  nothing, because `running` is already the default.

- **An inline `<a>` reports a ~16px box, whatever the line-height around it.**
  A `text-sm` link in a list measures 16px tall, not 20, so a vertical stack of
  links fails the 24px touch-target minimum even though it looks roomy. Give
  standalone links real padding (`inline-block py-1.5`) and take the rhythm back
  out of the gap. Links *inside a sentence* are exempt — padding those makes
  neighbouring lines overlap, which is worse than the small target.

- **A separator and the item it introduces must be one flex child.** A strip
  built as `<span>/</span><span>rev. …</span>` wraps between the two, and a line
  ends on a dangling `/`. Group them in a single `whitespace-nowrap` child so
  the slash travels with its value — this bit both `MetaLine` and the footer's
  build-metadata strip.

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
