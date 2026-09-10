import { defineCollection, z, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";

/**
 * The content contract for this site.
 *
 * Every markdown file under src/content/ is validated against one of these
 * schemas at build time, so a typo in frontmatter is a build error naming the
 * file rather than a silently empty section. If you are editing content, read
 * the relevant schema first — it is the list of fields that actually exist.
 */

/** An image plus its alt text. `image()` resolves the path and validates it. */
const imageItem = (image: SchemaContext["image"]) =>
  z.object({
    image: image(),
    description: z.string().default(""),
    subText: z.string().optional(),
  });

const link = z.object({
  label: z.string(),
  link: z.string(),
});

/**
 * Homepage sections. `type` picks which component renders the file, and which
 * fields are legal — get it wrong and zod says so. Frontmatter becomes props;
 * the markdown body becomes the component's default slot.
 */
const sections = defineCollection({
  loader: glob({
    base: "./src/content/sections",
    pattern: "**/*.mdx",
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ""),
  }),
  schema: ({ image }) =>
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("banner"),
        text: z.string(),
      }),
      z.object({
        type: z.literal("hero"),
        title: z.string(),
        subtitle: z.string(),
        /** Small mono line above the name — availability, location, status. */
        kicker: z.string().default(""),
        /** One or two sentences saying what you actually do. */
        intro: z.string().default(""),
        tags: z.array(z.object({ label: z.string() })).default([]),
        /** First renders solid, the rest outlined. Two is plenty. */
        ctas: z.array(link).default([]),
        imageItems: z.array(imageItem(image)).default([]),
      }),
      z.object({
        type: z.literal("textWithLargeImage"),
        title: z.string(),
        subtitle: z.string(),
        imageItem: imageItem(image).optional(),
        bulletPoints: z
          .array(
            z.object({
              title: z.string(),
              text: z.string(),
              /** Resolved by astro-icon against astro-template/astro/icons. */
              icon: z.string(),
            }),
          )
          .default([]),
      }),
      z.object({
        type: z.literal("toolsShowcase"),
        title: z.string(),
        subtitle: z.string(),
        tools: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              link: z.string(),
              linkLabel: z.string(),
              /** Known keys render a matching SVG; anything else gets a star. */
              icon: z.string().default("wrench"),
            }),
          )
          .default([]),
      }),
      z.object({
        type: z.literal("photoCollage"),
        title: z.string(),
        subtitle: z.string(),
        smallText: z.string().default(""),
        button: link,
      }),
      z.object({
        type: z.literal("simpleBlogRenderer"),
        title: z.string(),
        subtitle: z.string(),
      }),
    ]),
});

/**
 * Blog posts. The id is the filename, lowercased, and it is the URL — these are
 * indexed, so renaming a file breaks an existing link.
 */
const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.mdx",
    generateId: ({ entry }) => entry.replace(/\.mdx$/, "").toLowerCase(),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.string(),
      date: z.coerce.date(),
      /** Keeps a draft out of the index and out of the build entirely. */
      ishidden: z.boolean().default(false),
      imageItem: imageItem(image),
    }),
});

/**
 * Photo albums. Photos are not listed here: an album's images are every file
 * under `src/assets/gallery/<id>/`, so the id must match that folder name
 * exactly. It is not lowercased for that reason.
 */
const gallery = defineCollection({
  loader: glob({
    base: "./src/content/gallery",
    pattern: "**/*.md",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
  }),
});

export const collections = { sections, blog, gallery };
