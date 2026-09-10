const preset = require("./astro-template/tailwind.preset.cjs");

/** @type {import('tailwindcss').Config} */
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
      // Site-specific overrides go here. The preset's defaults are already the
      // vegt.dev palette, so there is nothing to override yet.
    },
  },
};
