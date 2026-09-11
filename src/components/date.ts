import { site } from "../site";

/**
 * One date format for the whole site.
 *
 * Three formats were in play: `SimpleBlogRenderer` called `toDateString()`
 * ("Mon Jun 15 2026"), `BlogList` and `BlogLayout` hardcoded `en-GB`
 * ("15 June 2026"), and the gallery used `nl-NL`. On a `lang="nl"` site the
 * first two are simply wrong, and the pair of them disagreed about the same
 * post on two pages that link to each other.
 *
 * Schema dates are already `Date` objects (`z.coerce.date()`), so nothing here
 * needs to re-parse them.
 */
export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string {
  return date.toLocaleDateString(site.lang, options);
}

/** Compact form for dense lists, e.g. "06-2025" in the gallery sidebar. */
export function formatMonth(date: Date): string {
  return formatDate(date, { month: "2-digit", year: "numeric" }).replace(" ", "-");
}
