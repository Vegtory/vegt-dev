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
 * The site's five verbs — see `src/components/topics.ts`, which holds the
 * label and mark colour for each. Constrained here so a mistyped topic is a
 * build error rather than a section that quietly renders with no label.
 */
const topicKey = z.enum(["build", "tinker", "write", "shoot", "talk"]);

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
        /** The name. This is the headline; there is no job-title field, on
         *  purpose — see the note at the top of `Hero.astro`. */
        title: z.string(),
        /** One sentence that sounds like a person wrote it. */
        intro: z.string().default(""),
        /** The mono strip under the name. Four or five words, lowercase. */
        meta: z.array(z.string()).default([]),
        /** The numbered list over the portrait. Three is the right number —
         *  it scans in one glance and leaves the photograph room. */
        roles: z.array(z.string()).default([]),
        /** First renders solid, the rest outlined. Two is plenty. */
        ctas: z.array(link).default([]),
        imageItems: z.array(imageItem(image)).default([]),
      }),

      z.object({
        type: z.literal("textWithLargeImage"),
        title: z.string(),
        subtitle: z.string().default(""),
        topic: topicKey.optional(),
        index: z.string().default(""),
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
        subtitle: z.string().default(""),
        topic: topicKey.optional(),
        index: z.string().default(""),
        /** Pencilled note in the margin of the card grid. */
        note: z.string().default(""),
        tools: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              link: z.string(),
              linkLabel: z.string(),
              /** Known keys render a matching SVG; anything else gets a star. */
              icon: z.string().default("wrench"),
              /** A `key: value` chip. Both halves are free text, so this can
               *  carry a joke or a plain fact in the same shape. */
              status: z
                .object({
                  label: z.string(),
                  value: z.string(),
                  state: z.enum(["neutral", "ok", "wip", "off"]).default("neutral"),
                  live: z.boolean().default(false),
                })
                .optional(),
              /** Faint package-style tags, e.g. "astro@cloud". */
              tags: z.array(z.string()).default([]),
            }),
          )
          .default([]),
      }),

      /**
       * The homelab / making section. Its own type rather than a second
       * `toolsShowcase`, because these entries are things that exist in a
       * house rather than things with a URL: no link, but a status worth
       * showing.
       */
      z.object({
        type: z.literal("tinkerGrid"),
        title: z.string(),
        subtitle: z.string().default(""),
        topic: topicKey.optional(),
        index: z.string().default(""),
        note: z.string().default(""),
        items: z
          .array(
            z.object({
              title: z.string(),
              text: z.string(),
              /** Where it lives. Rendered as mono metadata. */
              where: z.string().default(""),
              status: z
                .object({
                  label: z.string(),
                  value: z.string(),
                  state: z.enum(["neutral", "ok", "wip", "off"]).default("neutral"),
                  live: z.boolean().default(false),
                })
                .optional(),
              /** Optional link out, e.g. to the post about it. */
              link: z.string().default(""),
            }),
          )
          .default([]),
      }),

      /**
       * The speaking moment, roughly halfway down the page: one large
       * photograph and a short paragraph. The metadata under the photo is
       * free text so it can say only what is actually true of the talk.
       */
      z.object({
        type: z.literal("speaking"),
        title: z.string(),
        subtitle: z.string().default(""),
        topic: topicKey.optional(),
        index: z.string().default(""),
        imageItem: imageItem(image).optional(),
        /** Lines under the photograph, e.g. "Nijmegen / 2024". */
        captionMeta: z.array(z.string()).default([]),
        note: z.string().default(""),
        cta: link.optional(),
      }),

      /**
       * A photograph interrupting the technical content. Not a gallery — one
       * picture, big, with a caption, so the page has a person in it.
       */
      z.object({
        type: z.literal("photoInterrupt"),
        imageItem: imageItem(image),
        /** Rendered as a `//` source comment under the frame. */
        captionMeta: z.array(z.string()).default([]),
        note: z.string().default(""),
      }),

      z.object({
        type: z.literal("photoCollage"),
        title: z.string(),
        subtitle: z.string().default(""),
        topic: topicKey.optional(),
        index: z.string().default(""),
        smallText: z.string().default(""),
        button: link,
      }),

      z.object({
        type: z.literal("simpleBlogRenderer"),
        title: z.string(),
        subtitle: z.string().default(""),
        topic: topicKey.optional(),
        index: z.string().default(""),
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
      /** Which of the five verbs this post belongs to. Optional: a post
       *  without one simply renders no topic tag. */
      topic: topicKey.optional(),
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
    /** Where it was taken, if it is one place. Shown as mono metadata.
     *  Note there is deliberately no camera/exposure field: these JPEGs were
     *  exported without EXIF, so any such value would have to be invented. */
    place: z.string().optional(),
  }),
});

export const collections = { sections, blog, gallery };
