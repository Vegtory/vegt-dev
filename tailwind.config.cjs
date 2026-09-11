const preset = require("./astro-template/tailwind.preset.cjs");

/**
 * Design tokens for vegt.dev.
 *
 * The look is a technical field journal printed on silver: cool light grey
 * stock, near-black type, hairline rules, and saturated colour used the way it
 * turns up on a workbench — a highlighter stripe, a registration mark, an LED,
 * the sleeve of one cable in a bundle. Colour is never the subject, and there
 * is deliberately no "section colour" scheme, because assigning one hue per
 * section is the SaaS-landing-page move this design is trying not to make.
 *
 * The neutral was warm paper (#faf8f4) until the hero gained its ambient
 * washes. Warm paper under a warm wash reads as one muddy cream; a cool silver
 * ground is what lets the peach and amber register as light falling on the
 * page rather than as the page's own colour. Everything cooled with it so the
 * site does not split into a cold hero above a warm body.
 *
 * The previous iteration of this file described a "dark-anchored, light body"
 * system: near-black bands at the hero and footer, two drifting glows and a
 * panning dot grid. That is the generated-developer-portfolio look, so the ink
 * bands, the glows and the grid are gone. `ink` survives as a text and code
 * scale only.
 *
 * Contrast: every value used for text was computed against the surface it
 * actually sits on; the figure in each comment is the WCAG ratio. The accent
 * families split this explicitly — `DEFAULT` is the *mark* (rules, dots, fills,
 * highlighter swipes) and `ink` is the only member safe to set type in. Two of
 * the five marks cannot carry meaning on their own at any size, and they are
 * labelled as such below so nobody reaches for them by accident.
 *
 * Every `ink` member clears 4.5:1 against `surfaceMuted`, not just against
 * `background`. That is the binding constraint, because the status chips fill
 * with `surfaceMuted` and it is the darkest of the three surfaces — checked
 * against the page alone, `acid.ink` and `amber.ink` both passed at ~4.7 and
 * then landed at ~4.35 on the chip they are actually used on.
 */

/** Near-black with a cool cast, so it sits on silver rather than on white. */
const ink = {
  50: "#f4f6f8",
  100: "#e6eaef",
  200: "#d0d6de",
  300: "#a9b2be",
  400: "#7d8695",
  500: "#5a6472",
  600: "#454e5c",
  700: "#353d49",
  800: "#232a34",
  900: "#181d25",
  950: "#12151b",
};

/**
 * Cobalt, as a full scale. It is the one accent that does structural work —
 * links, the primary button, focus rings — so it needs the range. The other
 * four are marks and get three values each.
 */
const primary = {
  50: "#eff4fe",
  100: "#e1eafd",
  200: "#c7d8fb",
  300: "#a1bef7",
  400: "#749cf2",
  500: "#5179ea",
  600: "#2563eb",
  700: "#1d4ed8",
  800: "#1d43ad",
  900: "#1d3c89",
  950: "#162653",
};

/**
 * The mark palette.
 *
 * `DEFAULT` is the ink-on-paper mark. `ink` is the darkened member, and the
 * ONLY one of the three that may be used for text — each clears 4.5:1 on
 * `surfaceMuted`, the darkest surface any of them lands on. `wash` is a tint
 * for fills behind type, light enough that `primaryText` still reads at better
 * than 15:1 on top of it.
 */
const marks = {
  /** 4.87:1 as a mark. The structural accent; see `primary` for its scale. */
  cobalt: { DEFAULT: "#2563eb", ink: "#1d4ed8", wash: "#e4ebfb" },
  /** 3.47:1 as a mark — fine for a rule or a dot, never for small type. */
  tomato: { DEFAULT: "#e4572e", ink: "#ad3818", wash: "#f7e4dd" },
  /** 1.86:1. DECORATIVE ONLY: a highlighter swipe, an LED, a plot line that
   *  is also labelled. It must never be the sole carrier of meaning. */
  acid: { DEFAULT: "#84cc16", ink: "#456d0d", wash: "#eaf4d7" },
  /** 3.99:1 as a mark. */
  violet: { DEFAULT: "#8b5cf6", ink: "#6d28d9", wash: "#ece6fc" },
  /** 2.64:1. DECORATIVE ONLY, same rule as `acid`. */
  amber: { DEFAULT: "#f97316", ink: "#a44b08", wash: "#fae7d3" },
};

module.exports = {
  // The preset supplies the typography plugin and the placeholder tokens those
  // components expect. Those deep-merge from presets; `content` does NOT -- a
  // project's `content` replaces the preset's -- so the template's own files
  // have to be listed here explicitly, via the glob the preset exports for
  // exactly this.
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
        primary,
        ...marks,

        // --- Surfaces -----------------------------------------------------
        /** The page. Cool silver — light stock, not white. */
        background: "#eef1f5",
        /** Cards and anything that should lift off the page. Pure white now
         *  genuinely lifts, which it barely did against warm paper. */
        surface: "#ffffff",
        /** Recessed fills — metadata blocks, code chips, table stripes. */
        surfaceMuted: "#e3e8ee",
        /** The workhorse rule. Everything is separated by a hairline, not a shadow. */
        hairline: "#d7dde5",
        /** A second, darker rule for the one edge per section that should read
         *  as drawn rather than as a seam. */
        hairlineStrong: "#b4bdc8",

        // --- Text ---------------------------------------------------------
        /** Headings. 15.8:1 on `background`. */
        primaryText: "#131720",
        /** Body copy. Same value: at this weight it is comfortable, and two
         *  near-identical near-blacks is a distinction nobody can see. */
        blackText: "#131720",
        /** Secondary copy, metadata, captions. 5.7:1. */
        mutedText: "#555f6d",
        /** Annotations — the pencilled margin notes. 5.2:1, and only ever
         *  used at 13px+ italic, never for anything load-bearing. */
        noteText: "#5d6573",
        /** The one link/accent text colour. Cobalt at 6.3:1. */
        accentText: "#1d4ed8",

        // --- Text on dark -------------------------------------------------
        // Only the code blocks and the 404 plate are dark now.
        /** On `ink-950`: 16.0:1. */
        whiteText: "#eef1f5",
        secondaryText: "#1a1b1f",
      },

      fontFamily: {
        // System stacks on purpose, and this is load-bearing: the About copy
        // links to the site's own PageSpeed score, so a render-blocking
        // webfont would undercut the one claim the page actually makes. The
        // editorial feel here comes from scale, weight and tracking instead.
        // It is also why the pencilled annotations are set in italic rather
        // than in a handwriting face.
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
        // Instrument labels: eyebrows, metadata, tags, status lines, the
        // wordmark. Never body copy.
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

      // Paper is cut and ruled, not rounded. Nothing here exceeds 8px, so a
      // card reads as a pasted-in rectangle rather than as a UI pill. These
      // override Tailwind's defaults at the same names, which is what restyles
      // the components that already say `rounded-2xl`.
      borderRadius: {
        DEFAULT: "2px",
        sm: "1px",
        md: "3px",
        lg: "3px",
        xl: "4px",
        "2xl": "6px",
        "3xl": "8px",
      },

      backgroundImage: {
        /** Engineering graph paper. Used at low opacity behind one or two
         *  blocks per page, never the whole page. */
        graph:
          "linear-gradient(to right, #b4bdc8 1px, transparent 1px), linear-gradient(to bottom, #b4bdc8 1px, transparent 1px)",
        /** A highlighter swipe, for marking a few words inside a heading. */
        marker:
          "linear-gradient(to bottom, transparent 58%, rgba(132, 204, 22, 0.45) 58%)",
      },

      // No `backgroundSize.graph` to pair with `backgroundImage.graph`: both
      // families generate `bg-<key>`, so a shared key emits two different
      // `.bg-graph` rules and whichever loses the cascade silently does
      // nothing. Callers set the tile size with `bg-[length:22px_22px]`, which
      // also keeps the 22px in view next to the 1px gradient stops it has to
      // agree with.

      /**
       * Motion.
       *
       * All of it is ambient: nothing here has to run for the interface to be
       * understandable, which is the condition for decorative motion. Reach
       * for these through Tailwind's `motion-safe:` variant, never bare — that
       * compiles to `@media (prefers-reduced-motion: no-preference)`, so a
       * reader who asked their OS for less movement gets a still page rather
       * than a page that merely moves less.
       *
       * The permanently-running ones (`node-pulse`) animate `opacity` only, so
       * the browser composites them without a repaint.
       */
      keyframes: {
        /** The caret that turns up at the end of a heading. `step-end` in the
         *  timing keeps it snapping rather than fading. */
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },

        /** A solder pad / status LED, breathing. Deliberately shallow: the
         *  point is that you notice it only if you look at it. */
        "node-pulse": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },

        /** Entrance for the hero. Section reveals use a CSS transition. */
        "rise-in": {
          from: { opacity: "0", transform: "translate3d(0, 14px, 0)" },
          to: { opacity: "1", transform: "none" },
        },

        /** A connection being established — the dashes crawl along the path
         *  once, on hover. 12 is the dash cycle set on the path itself; any
         *  other value makes the loop visibly jump. */
        trace: {
          from: { strokeDashoffset: "12" },
          to: { strokeDashoffset: "0" },
        },

        /**
         * The ambient washes behind the hero portrait.
         *
         * Three of them, on deliberately mismatched periods, so the pattern
         * they make together never repeats within any plausible visit — with
         * 83s, 107s and 131s the trio only returns to its starting
         * arrangement after about nine and a half days.
         *
         * The movements are large in distance but glacial in rate: a wash
         * crosses a few percent of the viewport per minute, which is slow
         * enough that you cannot catch it moving by staring, only by looking
         * away and back. That is the brief. Anything faster and a coloured
         * blob is sliding around behind a photograph, which is the effect this
         * design spent its whole first pass avoiding.
         *
         * `transform` only, so the browser composites them without a repaint
         * and the cost of running forever is close to nothing.
         */
        "wash-a": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(6%, -4%, 0) scale(1.18)" },
        },
        "wash-b": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1.12)" },
          "50%": { transform: "translate3d(-7%, 5%, 0) scale(0.94)" },
        },
        "wash-c": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1.05)" },
          "50%": { transform: "translate3d(4%, 6%, 0) scale(1.22)" },
        },
      },

      animation: {
        blink: "blink 1.15s step-end infinite",
        "node-pulse": "node-pulse 2.4s ease-in-out infinite",
        // `backwards` holds the opening frame during the delay, so a staggered
        // element stays invisible until its turn instead of flashing first.
        "rise-in": "rise-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards",
        trace: "trace 0.7s linear forwards",
        // Coprime-ish minute-scale periods; see the keyframes above.
        "wash-a": "wash-a 83s ease-in-out infinite",
        "wash-b": "wash-b 107s ease-in-out infinite",
        "wash-c": "wash-c 131s ease-in-out infinite",
      },
    },
  },
};
