# MeningFermam — ommaviy sayt (faqat frontend)

Chorvadorlar uchun ommaviy veb-sayt: 10 blokli bosh sahifa, 10 ichki sahifa, 404, SEO.
To'liq statik (`apps/sayt/out/`): serverda Node.js yoki baza kerak emas, istalgan hostingga yuklanadi.

```bash
npm install
npm run dev                     # ishlab chiqish
npm run lint && npm run typecheck && npm test && npm run build
npm run serve                   # out/ ni lokal ko'rish (http://localhost:3100)
```

- `apps/sayt` — sayt; `packages/content` — kontent sxemalari va qoidalari (testlar uchun).
- Hujjatlar: `docs/VSCODE_TZ.md` (ishlash va hostingga yuklash), `docs/DECISIONS.md`, `docs/TEST_REPORT.md`, `docs/VISUAL_PARITY_REPORT.md`, `docs/MATNLAR_QORALAMA.md`.
- Backend (admin panel, baza) 2026-10-12 da olib tashlangan va `Downloads/meningfermam-backend-arxiv-2026-10-12` ga arxivlangan.
