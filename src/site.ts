/**
 * Site-wide settings. Anything that appears on more than one page but is not
 * content belongs here rather than being repeated in each page's frontmatter.
 */
export const site = {
  name: "William van der Vegt",
  url: "https://www.vegt.dev",
  lang: "nl",
  locale: "nl_NL",

  /** Shown in the header and footer. The dot is coloured; keep one. */
  wordmark: "vegt.dev",

  /**
   * How the site describes itself internally. Not rendered anywhere — it is
   * here as the brief for anyone editing copy, including future-you. Every
   * line on this site should sound like it belongs under this heading, and
   * "Full-stack Software Developer" does not.
   */
  premise: "software, systemen en dingen die ik waarschijnlijk niet had hoeven bouwen",

  /** Umami analytics website id. Set to undefined to ship no analytics. */
  umamiId: "51c87957-9791-4f42-9c38-94b13f46a5d5",

  /**
   * Contact and profiles, rendered by the footer. The email is reversed in the
   * built HTML by the email-obscurer integration, so write it plainly here.
   *
   * An empty string renders nothing at all, which is the point: only `email`
   * and `github` are filled in below, because those are the only two this
   * repository actually evidences (the email from over.mdx, the handle from
   * the ModBus post, which links to "my Github"). Fill the rest in yourself
   * rather than letting a guessed URL ship.
   */
  email: "william@vegt.dev",
  social: {
    github: "https://github.com/Wixewr",
    linkedin: "",
    instagram: "",
  },

  /**
   * The site's own navigation. One list, used by every page's header.
   *
   * Deliberately ordinary labels in a deliberately ordinary order. The
   * identity on this site comes from the typography, the marks and the
   * photographs; spending it on inventive navigation would only make the
   * links harder to find. The URLs under them are unchanged — /blog and
   * /gallery are indexed — so only what the reader is called has moved.
   */
  nav: [
    { label: "Over", link: "/#over" },
    { label: "Projecten", link: "/#bouwen" },
    { label: "Notities", link: "/blog" },
    { label: "Foto's", link: "/gallery" },
  ],
} as const;

export default site;
