import { fileURLToPath } from "node:url";

import { defineConfig, sharpImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";

import { emailObscurerIntegration } from "./src/integrations/email-obscurer.mjs";

export default defineConfig({
  site: "https://www.vegt.dev",

  image: { service: sharpImageService() },
  build: { inlineStylesheets: "auto" },

  vite: {
    build: { assetsInlineLimit: 15_000 },
    resolve: {
      alias: {
        // `@ui` is this site's own components. Template components import their
        // peers through it, which is what lets one be used as-is or copied into
        // src/components/ without editing a single import line. It also keeps
        // exactly one CustomPicture module in the build, and therefore one
        // asset glob and one sharp pipeline.
        "@ui": fileURLToPath(new URL("./src/components", import.meta.url)),
        "@template": fileURLToPath(
          new URL("./astro-template/astro/components", import.meta.url),
        ),
      },
    },
  },

  integrations: [
    // Reverses email addresses in the output HTML so scrapers miss them.
    emailObscurerIntegration(),
    tailwind(),
    sitemap(),
    mdx(),
    icon({ iconDir: "astro-template/astro/icons" }),
  ],
});
