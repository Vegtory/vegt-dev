/**
 * Prose styling, in one place.
 *
 * `@tailwindcss/typography` ships a grey ramp that has nothing to do with this
 * site's tokens, so every place that rendered markdown drifted: the homepage
 * sections used bare `prose`, the blog article used a long inline modifier
 * list, and links came out three different blues. These constants are the
 * shared answer.
 *
 * They are plain literal strings on purpose — Tailwind's scanner reads .ts
 * files, so it sees these classes, but it would not see them if they were
 * assembled at runtime.
 */

/**
 * Inline code, as a marked-up chip: square, ruled, ink.
 *
 * This lives in `proseBase` rather than only in `proseArticle` because
 * `@tailwindcss/typography` renders a literal backtick before and after every
 * `<code>` via `::before`/`::after`, and only the article style used to reset
 * them — so a homepage section that mentioned `scripts` in passing printed the
 * backticks on the page.
 */
const codeChip = [
  "prose-code:text-primaryText prose-code:bg-surfaceMuted prose-code:px-1.5 prose-code:py-0.5",
  "prose-code:rounded-sm prose-code:text-[0.9em] prose-code:font-mono",
  "prose-code:border prose-code:border-hairline prose-code:font-normal",
  "prose-code:before:content-none prose-code:after:content-none",
].join(" ");

/** Body copy inside a section: homepage sections, section intros. */
export const proseBase = [
  "prose prose-lg max-w-none",
  "prose-p:text-blackText prose-li:text-blackText",
  "prose-headings:text-primaryText prose-headings:font-semibold prose-headings:tracking-tight",
  "prose-strong:text-primaryText",
  // Cobalt is the one link colour on the site, and this is one of the few
  // places it sets type — hence the `-ink` member rather than the mark.
  "prose-a:text-cobalt-ink prose-a:font-medium prose-a:no-underline hover:prose-a:text-ink-950 hover:prose-a:underline",
  "prose-a:underline-offset-4",
  codeChip,
].join(" ");

/** The same, sized down for cards and captions. */
export const proseSmall = [
  "prose prose-base max-w-none",
  "prose-p:text-mutedText prose-li:text-mutedText",
  "prose-headings:text-primaryText prose-headings:font-semibold",
  "prose-strong:text-primaryText",
  "prose-a:text-cobalt-ink prose-a:no-underline hover:prose-a:text-ink-950 hover:prose-a:underline",
  "prose-a:underline-offset-4",
  codeChip,
].join(" ");

/** A full blog article: everything above, plus code, quotes and figures. */
export const proseArticle = [
  proseBase,
  // The layout already renders the post title as the page's <h1>, so an <h1>
  // in the body is a second one. Three posts opened their sections with `#`
  // (now `##`); this keeps a future slip from outranking the title visually,
  // even though the markdown is the place to fix it.
  "prose-h1:mt-14 prose-h1:text-2xl prose-h1:border-b prose-h1:border-hairline prose-h1:pb-3",
  "prose-h2:mt-14 prose-h2:text-2xl prose-h2:border-b prose-h2:border-hairline prose-h2:pb-3",
  "prose-h3:mt-10 prose-h3:text-xl",
  // Inline code comes from `codeChip` via `proseBase`. Only the block-level
  // treatment is article-specific.
  "prose-pre:bg-ink-950 prose-pre:text-ink-100 prose-pre:rounded prose-pre:border prose-pre:border-ink-800",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit [&_pre_code]:border-0 [&_pre_code]:rounded-none",
  "prose-img:rounded-none",
  "prose-blockquote:border-l-2 prose-blockquote:border-l-cobalt prose-blockquote:text-mutedText prose-blockquote:not-italic",
  "prose-hr:border-hairline",
  /**
   * Footnotes as source comments.
   *
   * `remark-gfm` (bundled with Astro's MDX integration) renders `[^1]`
   * footnotes into `<section class="footnotes">`, and this restyles that
   * section into an aside written the way a developer would write one: mono,
   * small, each line opened by a dim `//`.
   *
   * The marker is generated content, so it is never in the accessibility tree
   * and no screen reader announces "slash slash" before every note. That is
   * the whole reason it is a `::before` rather than a character in the source.
   */
  "[&_.footnotes]:mt-14 [&_.footnotes]:border-t [&_.footnotes]:border-hairline [&_.footnotes]:pt-6",
  "[&_.footnotes]:font-mono [&_.footnotes]:text-[0.8125rem] [&_.footnotes]:text-mutedText",
  "[&_.footnotes_h2]:sr-only",
  "[&_.footnotes_ol]:list-none [&_.footnotes_ol]:pl-0",
  "[&_.footnotes_li]:relative [&_.footnotes_li]:pl-8",
  "[&_.footnotes_li]:before:absolute [&_.footnotes_li]:before:left-0 [&_.footnotes_li]:before:text-hairlineStrong [&_.footnotes_li]:before:content-['//']",
  "[&_.footnotes_p]:text-mutedText [&_.footnotes_p]:my-1",
].join(" ");
