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
  pages/              routes
  components/         this site's components; yours to change freely
  layouts/            BaseLayout, BlogLayout
  assets/             images
  site.ts             site-wide settings (name, lang, analytics id)
astro-template/       submodule: shared components, imported as @template/*
contact-worker/       Cloudflare Worker serving /api/contact
cdktf/                DNS + R2 provisioning, run by hand
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

Tailwind, with tokens from the template's preset — `bg-background`,
`text-primaryText`, `text-accentText`, and the `primary`/`secondary`/`accent`
scales. Override them in `tailwind.config.cjs` under `theme.extend`. Never
hardcode a hex value, and never build a class name by string concatenation:
Tailwind only sees complete literals.

## Commands

```bash
pnpm dev             # localhost:8080
pnpm build           # static build to dist/
pnpm check           # astro check (typecheck) - run before committing
pnpm check:template  # which copied components have upstream updates
pnpm dev:worker      # wrangler dev, the only way to test /api/contact
pnpm deploy          # astro build && wrangler deploy
```

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
- **`PhotoCollage` reshuffles on every build.** The homepage collage picks four
  random gallery photos at build time, so consecutive deploys differ.
