// Unit test cho bo chen link affiliate (scripts/lib/affiliate.mjs). Chay: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { insertAffiliateLinks } from "../lib/affiliate.mjs";

const MAP = [
  { slug: "chatgpt", keywords: ["ChatGPT"], website: "https://chatgpt.com" },
  { slug: "chatgpt-plus", keywords: ["ChatGPT Plus"], website: "https://chatgpt.com" },
  { slug: "jasper", keywords: ["Jasper", "Jasper AI"], website: "https://jasper.ai" },
];
const a = (slug, text) => `<a href="/go/${slug}" rel="sponsored nofollow" target="_blank">${text}</a>`;

test("chen link /go/<slug> voi rel sponsored, giu nguyen chu hoa/thuong", () => {
  const { body, inserted } = insertAffiliateLinks("Dung thu jasper ngay.", MAP);
  assert.equal(body, `Dung thu ${a("jasper", "jasper")} ngay.`);
  assert.deepEqual(inserted.map((i) => i.slug), ["jasper"]);
});

test("cum dai thang cum ngan (ChatGPT Plus truoc ChatGPT)", () => {
  const { body } = insertAffiliateLinks("Goi ChatGPT Plus dang gia.", MAP);
  assert.ok(body.includes(a("chatgpt-plus", "ChatGPT Plus")));
  assert.ok(!body.includes("/go/chatgpt\""));
});

test("khong chen trong heading, code, link Markdown/HTML co san, blockquote, bang", () => {
  const md = [
    "## Jasper la gi",
    "```",
    "Jasper trong code",
    "```",
    "Xem `Jasper` va [Jasper](https://x.y) va <a href=\"https://x.y\">Jasper AI</a>",
    "> Jasper trich dan",
    "| Jasper | 49 |",
  ].join("\n");
  const { body, inserted } = insertAffiliateLinks(md, MAP);
  assert.equal(body, md);
  assert.equal(inserted.length, 0);
});

test("ngung chen sau muc Nguon tham khao", () => {
  const md = "Mo bai.\n\n## Nguồn tham khảo\n\n- Jasper docs";
  assert.equal(insertAffiliateLinks(md, MAP).inserted.length, 0);
});

test("gioi han 1 link/tool, tool chinh (primarySlug) toi da 2, tong toi da maxTotal", () => {
  const md = "Jasper tot.\nJasper re.\nJasper nhanh.\nChatGPT cung on.";
  assert.equal(insertAffiliateLinks(md, MAP).inserted.filter((i) => i.slug === "jasper").length, 1);
  assert.equal(
    insertAffiliateLinks(md, MAP, { primarySlug: "jasper" }).inserted.filter((i) => i.slug === "jasper").length,
    2,
  );
  assert.equal(insertAffiliateLinks(md, MAP, { maxTotal: 1 }).inserted.length, 1);
});

test("idempotent: chay lai tren bai da co link khong chen them", () => {
  const once = insertAffiliateLinks("Jasper va ChatGPT.", MAP).body;
  const twice = insertAffiliateLinks(once, MAP);
  assert.equal(twice.body, once);
  assert.equal(twice.inserted.length, 0);
});

test("giu nguyen so va link Markdown tren dong co chen", () => {
  const line = "Xem [docs](https://a.b) roi thu Jasper goi 5 nguoi, 0 dong.";
  const { body } = insertAffiliateLinks(line, MAP);
  assert.equal(body, `Xem [docs](https://a.b) roi thu ${a("jasper", "Jasper")} goi 5 nguoi, 0 dong.`);
});
