import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE_URL } from "./src/consts.ts";

// https://astro.build/config
export default defineConfig({
  // QUAN TRỌNG cho SEO: phải khai báo đúng tên miền để sinh sitemap + canonical chuẩn
  site: SITE_URL,
  // /go/* la trang redirect affiliate (noindex) -> khong dua vao sitemap.
  // /tim-kiem/ (trang tien ich) va /tag/* (phan lon it bai, co the noindex) cung bo ra.
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/go/") && !page.includes("/tim-kiem") && !page.includes("/tag/"),
    }),
  ],
  // Build ra HTML tĩnh hoàn toàn (mặc định) -> phục vụ từ CDN, load cực nhanh
  compressHTML: true,
  build: {
    inlineStylesheets: "auto", // inline CSS nhỏ để giảm request -> LCP tốt hơn
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});
