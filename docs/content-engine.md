# Content Engine: gộp pipeline của gxg + soitool (+ vidgen)

> Trạng thái: **đề xuất**, chưa triển khai. Viết ngày 2026-10-04 dựa trên code hiện tại của `gxg@a4119b1` và `soitool@main`.

## 1. Hiện trạng: hai bản sao đang tách dần

`gxg` (Mystery Box, tiếng Anh) và `soitool` (review tool, tiếng Việt) dùng chung một bộ script, được copy qua lại:

| File | gxg / soitool (số dòng) | Khác nhau |
|---|---|---|
| `scripts/generate-og.mjs`, `indexnow.mjs`, `upload-media.mjs`, `shot.mjs`, `generate-logo.mjs` | giống hệt | 0 |
| `scripts/lib/r2.mjs`, `image.mjs`, `source-image.mjs`, `stock-image.mjs`, `youtube.mjs`, `deploy.mjs` | giống hệt | 0 |
| `scripts/lib/ai-post.mjs` | 499 / 661 | **202 dòng**: soitool có engine Claude, affiliate, `stripLeadingTitle` |
| `scripts/fetch-trends.mjs` | 254 / 271 | 53 dòng |
| `scripts/auto-trend-post.mjs`, `generate-ai-post.mjs` | 116/127, 98/113 | ~20 dòng |
| chỉ soitool: `lib/affiliate.mjs`, `lib/claude.mjs`, `money-post.mjs` | | |
| `src/components/SEO.astro` | | 52 dòng (soitool có FAQ, Rating, noindex) |

**Hệ quả thấy được:** soitool đã sửa lỗi bài AI lặp tiêu đề thành `# H1` (hàm `stripLeadingTitle`). gxg không có bản sửa này nên **70/104 bài của gxg bị 2 thẻ H1** (đã vá phần hiển thị ở GxG#2). Mỗi lần sửa một bên, bên kia không được hưởng.

Phần video (`vidgen`, `youtube-tiktok-research`) đang làm thủ công: bài blog của gxg với tiền tố `mb-` tương ứng các video `video-NN-*.json`, còn soitool có các file `short-*.json`.

## 2. Đề xuất: một package dùng chung, mỗi site chỉ giữ cấu hình

```
content-engine/            (repo mới hoặc thư mục packages/ trong 1 repo)
├─ src/
│  ├─ trends.mjs           fetch-trends (nguồn theo locale)
│  ├─ post.mjs             ai-post (engine gemini | claude, stripLeadingTitle, grounding bắt buộc)
│  ├─ affiliate.mjs        tuỳ chọn, chỉ site có affiliate-map mới bật
│  ├─ media/               r2, image, stock-image, source-image, youtube
│  ├─ og.mjs, indexnow.mjs
│  └─ video-brief.mjs      MỚI: từ 1 bài -> JSON kịch bản short cho vidgen
└─ bin/content.mjs         CLI: content trends | post | money | og | ping | video-brief

gxg/engine.config.mjs      { lang: "en", niche: "mystery facts", sources: [...], affiliate: false }
soitool/engine.config.mjs  { lang: "vi", niche: "AI/SaaS review", affiliate: "scripts/data/affiliate-map.json" }
```

Mỗi site cài engine qua `npm i github:tuhuudev/content-engine#v1`, script trong `package.json` đổi thành `content post ...`. Không cần publish lên npm.

### Luồng mục tiêu
```
trends ─► post (draft) ─► chủ duyệt ─► build/deploy ─► indexnow
                 └─► video-brief ─► vidgen build ─► YouTube/TikTok (link về bài)
```

## 3. Lộ trình (mỗi bước = 1 PR, có kiểm chứng)

1. **Tạo `content-engine`** từ bản của soitool (bản đầy đủ hơn). Thêm test Vitest cho các hàm thuần: `stripLeadingTitle`, parse frontmatter, `insertAffiliateLinks`, slugify. Thêm CI.
2. **soitool dùng engine.** Build ra kết quả giống hệt trước khi chuyển (so sánh `dist/`).
3. **gxg dùng engine.** gxg được nhận `stripLeadingTitle` và engine Claude. So sánh `dist/` như bước 2.
4. **`video-brief`.** Sinh JSON đúng schema `vidgen/topics/*.json` từ một bài. Kiểm chứng bằng `python -m vidgen build --dry-run`, hoặc chỉ render slide.
5. Xoá các bản sao trong `scripts/` của hai site.

## 4. Rủi ro / cần chủ quyết
- Nên tạo repo mới (`content-engine`) hay gộp gxg và soitool thành monorepo? Đề xuất: **repo mới**, vì hai site deploy riêng trên Cloudflare Pages.
- Engine Claude (`claude -p`) dùng quota gói Claude và chạy được ở local. Trên GitHub Actions vẫn cần engine Gemini (đã có).
- Không đổi nội dung hay URL đang có. Đây thuần là refactor công cụ.
