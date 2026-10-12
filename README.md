# MeningFermam — sayt va admin panel

Admin orqali saytning matnlari, dizayni, logo/rasmlari, bo'limlari, sahifalari, tugmalari, SEO va funksiya kartalari boshqariladi. Sonli maydon va formula berib yangi oddiy hisoblagich yaratish mumkin. Login — telefon raqami; parol va ikki bosqichli kod bilan himoyalangan.

```bash
npm install
npm run cms:migrate
npm run cms:build
npm run cms:start
```

Admin: **http://localhost:3200**. Sayt: **http://localhost:3100**. Ishlab chiqish uchun `npm run cms:dev`. `apps/admin/.env.local` ichida `DATABASE_URL` va `ADMIN_ENC_KEY` kerak. Mavjud shifrlash kalitini almashtirmang: u oldingi ikki bosqichli kirish ma'lumotlari uchun ishlatiladi.

Administrator bo'lmasa: `npm run admin:create -- --phone +998XXXXXXXXX --name "Ism"`. Parol terminalda yashirin so'raladi. Dastlabki sayt qiymatlarini olish: `npm run content:seed -- --by +998XXXXXXXXX` (mavjud nashrlarga tegmaydi).

Tahrir: **Sayt boshqaruvi → Qoralama saqlash → Nashr qilish**, keyin saytni yangilang. Batafsil foydalanish va Vercel sozlamalari: [ADMIN_CMS.md](docs/ADMIN_CMS.md).

Tuzilma: `apps/sayt` — ommaviy sayt; `apps/admin` — boshqaruv paneli; `packages/content` — sxemalar va formulalar; `packages/db` — baza va migratsiyalar. Backend qayta ulangan; oldingi arxiv alohida saqlangan.

Bazasiz statik rejim ham saqlanadi: `CMS_MODE` berilmasa `npm run build` → `apps/sayt/out/`, `npm run serve` orqali ko'riladi. Admin o'zgarishlari darhol chiqishi uchun **dinamik CMS rejimi** kerak.

Tekshiruvlar: `npm run lint`, `npm run typecheck`, `npm test`. Dalillar: [TEST_REPORT.md](docs/TEST_REPORT.md).
