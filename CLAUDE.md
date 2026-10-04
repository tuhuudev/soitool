# CLAUDE.md — soitool (Soi Tool)

Vietnamese affiliate blog reviewing AI/SaaS tools. Astro 5 static site, deployed to Cloudflare Pages by `npm run deploy` (direct upload; git push does NOT deploy). Read README.md "Mô hình kiếm tiền" first.

## Commands
- `npm ci` — install
- `npm test` — node:test unit tests (`scripts/test/`): affiliate inserter, slugify parity with `src/utils.ts`, and a content check that every `/go/<slug>` / `ctaTool` points at a routable entry in `affiliate-map.json`
- `npm run check` — `astro check` (types)
- `npm run build` — OG images → `astro build` → Pagefind. `test` + `check` + `build` must pass before any PR.
- `npm run ai:money` / `ai:auto` — AI post pipeline (see `.claude/commands/money-pack.md`, HUONG-DAN-*.md)

## Layout
- `src/content/posts/*.md` — posts; schema in `src/content.config.ts`.
- `scripts/data/affiliate-map.json` — single source of affiliate links. Posts link tools ONLY via `/go/<slug>`; never paste raw affiliate URLs into posts.
- `src/pages/go/[slug].astro` — noindex redirect page used for click counting.
- `src/consts.ts` — site config; empty values (CF_ANALYTICS_TOKEN, GISCUS, BUTTONDOWN_USERNAME…) are features waiting on the owner's accounts.
- `scripts/` pipeline is shared in spirit with the `gxg` repo (same origin); keep fixes in sync.

## Rules
- AI-written posts stay `draft: true` until the owner adds first-hand screenshots/notes and approves.
- Never invent affiliate URLs or flip a tool to `status: "active"` — only the owner does that after approval.
- Never commit `.env` or keys.
