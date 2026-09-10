const preset = require("./astro-template/tailwind.preset.cjs");

/**
 * Design tokens for vegt.dev.
 *
 * The look is "dark-anchored, light body": near-black `ink` bands (hero,
 * footer) bookend a warm off-white page. That split is the whole system —
 * pick colours from the `ink` scale on dark, from the flat text aliases on
 * light, and the contrast takes care of itself.
 *
 * Every value below was checked against its intended background; the ratio in
 * each comment is the WCAG figure. AA wants 4.5:1 for body text and 3:1 for
 * large text, so nothing here is borderline. The old cyan `accentText` sat at
 * 2.15:1 on the page background while being the colour of every section
 * heading, which is what made the site look washed out and inconsistent.
 */

/** Near-black slate with a blue cast, so the dark bands relate to `primary`. */
const ink = {
  50: "#f2f5f8",
  100: "#e7ecf1",
  200: "#d3dbe4",
  300: "#aebbc9",
  400: "#8494a8",
  500: "#5b6b82",
  600: "#405066",
  700: "#2b3a51",
  800: "#1b2739",
  900: "#111a2b",
  950: "#0b1220",
};

module.exports = {
  // The preset supplies the design tokens and the typography plugin. Those
  // deep-merge from presets; `content` does NOT -- a project's `content`
  // replaces the preset's -- so the template's own files have to be listed
  // here explicitly, via the glob the preset exports for exactly this.
  //
  // Drop `preset.templateContent` and the build still succeeds; it just omits
  // every utility class that no file under src/ happens to use, so template
  // components render unstyled.
  presets: [preset],
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    preset.templateContent,
  ],
  theme: {
    extend: {
      colors: {
        ink,

        // --- Surfaces -----------------------------------------------------
        /** The page. Warm off-white; flatters the photography. */
        background: "#f9f8f6",
        /** Cards and anything that should lift off the page. */
        surface: "#ffffff",
        /** Recessed fills — icon tiles, code chips, table stripes. */
        surfaceMuted: "#f2f0ec",
        /** The only border colour on light. Warm, to match `background`. */
        hairline: "#e4e0d9",

        // --- Text on light ------------------------------------------------
        /** Headings. 16.4:1 on `background`. */
        primaryText: "#111a2b",
        /** Body copy. 17.6:1 — reserved for long-form prose. */
        blackText: "#0b1220",
        /** Secondary copy, metadata, captions. 6.0:1 — replaces `text-gray-*`. */
        mutedText: "#526073",
        /** Accent text, mono eyebrows. Deep teal, 5.4:1 (was cyan at 2.1:1). */
        accentText: "#0f6f86",

        // --- Text on dark -------------------------------------------------
        /** On `ink-950`: 17.6:1. */
        whiteText: "#f9f8f6",
        secondaryText: "#111627",
      },

      fontFamily: {
        // System stacks on purpose. The site's own copy links to its PageSpeed
        // score, so a render-blocking webfont request would undercut the
        // claim it makes. Zero network cost, zero layout shift.
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        // The developer signal. Used for eyebrows, tags, metadata and the
        // wordmark — never for body copy, which stays comfortable to read.
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },

      // One radius step per role, so nothing is "nearly" the same shape as the
      // thing next to it: lg = chips, xl = buttons, 2xl = cards and images.
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
};
