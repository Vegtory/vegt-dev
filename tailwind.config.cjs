/** @type {import('tailwindcss').Config} */
module.exports = {
  // The preset supplies the design tokens, the typography plugin and its own
  // content glob for astro-template/. Tailwind concatenates `content` and
  // deep-merges `theme.extend`, so anything set here adds to it.
  presets: [require("./astro-template/tailwind.preset.cjs")],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      // Site-specific overrides go here. The preset's defaults are already the
      // vegt.dev palette, so there is nothing to override yet.
    },
  },
};
