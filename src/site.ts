/**
 * Site-wide settings. Anything that appears on more than one page but is not
 * content belongs here rather than being repeated in each page's frontmatter.
 */
export const site = {
  name: "William van der Vegt",
  url: "https://www.vegt.dev",
  lang: "nl",
  locale: "nl_NL",

  /** Shown in the header and footer. Mono-set, so keep it short. */
  wordmark: "vegt.dev",

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

  /** The site's own navigation. One list, used by every page's header. */
  nav: [
    { label: "Over", link: "/#Over" },
    { label: "Tools", link: "/#Tools" },
    { label: "Foto's", link: "/gallery" },
    { label: "Blog", link: "/blog" },
  ],
} as const;

export default site;
