import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import sanity from "@sanity/astro";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import cloudflare from "@astrojs/cloudflare";

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);

// https://astro.build/config
export default defineConfig({
  site: "https://portfolio-wm.wesley-work-software.workers.dev/",
  base: "/",
  trailingSlash: "ignore",
  prefetch: {
    prefetchAll: true
  },
  adapter: cloudflare(),
  integrations: [sanity({
    projectId: PUBLIC_SANITY_PROJECT_ID || "fik4vmxa",
    dataset: PUBLIC_SANITY_DATASET || "production",
    useCdn: false,
  }), react(), sitemap(), tailwind({
    config: {
      applyBaseStyles: false
    }
  }), AutoImport({
    imports: ["@components/common/Button.astro", "@shortcodes/Accordion", "@shortcodes/Notice", "@shortcodes/Youtube", "@shortcodes/Tabs", "@shortcodes/Tab"]
  }), mdx()],
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, {
      test: "Table of contents"
    }], remarkMath],
    rehypePlugins: [[rehypeKatex, {}]],
    shikiConfig: {
      themes: { // https://shiki.style/themes
        light: "light-plus",
        dark: "dark-plus",
      } 
    },
    extendDefaultPlugins: true
  },
});
