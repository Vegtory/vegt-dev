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

/** Body copy inside a light section: homepage sections, section intros. */
export const proseBase = [
  "prose prose-lg max-w-none",
  "prose-p:text-blackText prose-li:text-blackText",
  "prose-headings:text-primaryText prose-headings:font-semibold prose-headings:tracking-tight",
  "prose-strong:text-primaryText",
  "prose-a:text-primary-600 prose-a:font-medium prose-a:no-underline hover:prose-a:text-primary-700 hover:prose-a:underline",
  "prose-a:underline-offset-4",
].join(" ");

/** The same, sized down for cards and captions. */
export const proseSmall = [
  "prose prose-base max-w-none",
  "prose-p:text-mutedText prose-li:text-mutedText",
  "prose-headings:text-primaryText prose-headings:font-semibold",
  "prose-strong:text-primaryText",
  "prose-a:text-primary-600 prose-a:no-underline hover:prose-a:text-primary-700 hover:prose-a:underline",
  "prose-a:underline-offset-4",
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
  "prose-code:text-accentText prose-code:bg-surfaceMuted prose-code:px-1.5 prose-code:py-0.5",
  "prose-code:rounded-lg prose-code:text-sm prose-code:font-mono",
  "prose-code:before:content-none prose-code:after:content-none",
  "prose-pre:bg-ink-950 prose-pre:text-ink-100 prose-pre:rounded-2xl prose-pre:shadow-lg prose-pre:ring-1 prose-pre:ring-white/10",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit [&_pre_code]:rounded-none",
  "prose-img:rounded-2xl prose-img:shadow-md",
  "prose-blockquote:border-l-accentText prose-blockquote:text-mutedText prose-blockquote:not-italic",
  "prose-hr:border-hairline",
].join(" ");
