/**
 * Site-wide settings. Anything that appears on more than one page but is not
 * content belongs here rather than being repeated in each page's frontmatter.
 */
export const site = {
  name: "William van der Vegt",
  url: "https://www.vegt.dev",
  lang: "nl",
  locale: "nl_NL",

  /** Umami analytics website id. Set to undefined to ship no analytics. */
  umamiId: "51c87957-9791-4f42-9c38-94b13f46a5d5",
} as const;

export default site;
