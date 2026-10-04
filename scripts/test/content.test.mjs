// Kiem tra noi dung: moi link /go/<slug> va moi ctaTool trong bai deu tro toi tool co trong
// affiliate-map.json va co dich den (url hoac website). Neu khong, trang /go/<slug> khong duoc
// sinh ra -> nguoi doc bam vao gap 404 va mat hoa hong. Chay: npm test
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const map = JSON.parse(await fs.readFile(path.join(ROOT, "scripts/data/affiliate-map.json"), "utf-8"));
// Giong getStaticPaths cua src/pages/go/[slug].astro
const routable = new Set(map.links.filter((l) => l.slug && (l.url || l.website)).map((l) => l.slug));

async function filesUnder(dir, exts) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await filesUnder(p, exts)));
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(p);
  }
  return out;
}

const sources = [
  ...(await filesUnder(path.join(ROOT, "src/content"), [".md", ".mdx"])),
  ...(await filesUnder(path.join(ROOT, "src/components"), [".astro"])),
  ...(await filesUnder(path.join(ROOT, "src/pages"), [".astro"])),
];

test("affiliate-map: slug duy nhat, status hop le, active thi phai co url", () => {
  const slugs = map.links.map((l) => l.slug);
  assert.equal(new Set(slugs).size, slugs.length, "slug bi trung");
  for (const l of map.links) {
    assert.ok(["active", "pending", "closed", "none"].includes(l.status), `${l.slug}: status '${l.status}'`);
    if (l.status === "active") assert.ok(l.url, `${l.slug}: active nhung chua co url affiliate`);
    for (const u of [l.url, l.website, l.signup].filter(Boolean)) {
      assert.match(u, /^https:\/\//, `${l.slug}: URL phai la https (${u})`);
    }
  }
});

test("moi /go/<slug> trong noi dung va component deu co trang dich", async () => {
  const missing = [];
  for (const file of sources) {
    const text = await fs.readFile(file, "utf-8");
    for (const [, slug] of text.matchAll(/\/go\/([a-z0-9-]+)/g)) {
      if (!routable.has(slug)) missing.push(`${path.relative(ROOT, file)} -> /go/${slug}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("moi ctaTool trong frontmatter deu co trong affiliate-map", async () => {
  const missing = [];
  for (const file of sources.filter((f) => /\.mdx?$/.test(f))) {
    const m = (await fs.readFile(file, "utf-8")).match(/^ctaTool:\s*["']?([^"'\n]+)["']?\s*$/m);
    if (m && !routable.has(m[1].trim())) missing.push(`${path.relative(ROOT, file)} -> ${m[1]}`);
  }
  assert.deepEqual(missing, []);
});
