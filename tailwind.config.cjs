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

      /**
       * Motion.
       *
       * Every one of these animates `transform` or `opacity` only. Those are
       * the two properties a browser can hand to the compositor without a
       * layout or a repaint, which is what keeps a permanently-running
       * background from costing anything measurable — this site's own copy
       * links to its PageSpeed score.
       *
       * Reach for these through Tailwind's `motion-safe:` variant
       * (`motion-safe:animate-drift-slow`), never bare. That compiles to
       * `@media (prefers-reduced-motion: no-preference)`, so someone who has
       * asked their OS for less movement gets a completely still page rather
       * than a page that merely moves less.
       */
      keyframes: {
        /** Terminal caret. `step-end` in the timing keeps it snapping, not fading. */
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },

        // The two hero glows. Different durations and directions, both prime-ish,
        // so the pair never visibly returns to the same arrangement.
        "drift-slow": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(7%, 9%, 0) scale(1.15)" },
        },
        "drift-slower": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1.1)" },
          "50%": { transform: "translate3d(-9%, -7%, 0) scale(0.92)" },
        },

        /**
         * The dot grid, panning by exactly one 22px tile. Landing on the tile
         * size is what makes the loop seamless — any other distance and the
         * pattern visibly jumps when the animation restarts.
         */
        "grid-pan": {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(-22px, -22px, 0)" },
        },

        /** Hero entrance. Section reveals use a CSS transition, not this. */
        "rise-in": {
          from: { opacity: "0", transform: "translate3d(0, 14px, 0)" },
          to: { opacity: "1", transform: "none" },
        },
      },

      animation: {
        blink: "blink 1.05s step-end infinite",
        "drift-slow": "drift-slow 19s ease-in-out infinite",
        "drift-slower": "drift-slower 26s ease-in-out infinite",
        "grid-pan": "grid-pan 24s linear infinite",
        // `backwards` holds the opening frame during the delay, so a staggered
        // element stays invisible until its turn instead of flashing first.
        "rise-in": "rise-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards",
      },
    },
  },
};
