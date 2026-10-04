// slugify cua pipeline (scripts) PHAI trung voi src/utils.ts: URL bai = slugify(title),
// con ten file / link noi bo do script sinh ra dung ban scripts. Chay: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { slugify } from "../lib/ai-post.mjs";
import { slugify as siteSlugify } from "../../src/utils.ts";

for (const title of [
  "ChatGPT Plus 2026: đánh giá chi tiết — 20 USD/tháng có đáng giá?",
  "Đà Nẵng & Hội An: 10 điều!",
  "Cursor vs GitHub Copilot (2026)",
  "  Notion   vs -- Obsidian  ",
]) {
  test(`slugify khop src/utils.ts: ${title}`, () => {
    assert.equal(slugify(title), siteSlugify(title));
  });
}
