import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { authCtx, currentUser, readToken } from "@/lib/auth/next";
import { beginSetup } from "@/lib/auth/service";
import { SetupForm } from "../../forms";

// Birinchi kirish: ikki bosqichli kirishni sozlash (majburiy, ADMIN_TZ §4.1).
// Tasdiqlangach server action yangi cookie qo'yadi va sahifa qayta render bo'ladi: endi foydalanuvchi to'liq kirgan,
// shuning uchun daraxt o'sha tuzilmada qoladi — formadagi zaxira kodlar (faqat brauzer xotirasida) yo'qolmaydi.
export default async function Page() {
  const s = await beginSetup(await authCtx(), await readToken());
  const done = !s && !!(await currentUser());
  if (!s && !done) redirect("/kirish");
  const svg = s ? await QRCode.toString(s.uri, { type: "svg", margin: 0, errorCorrectionLevel: "M" }) : null; // QR serverda chiziladi
  const grouped = s ? (s.secret.match(/.{1,4}/g)?.join(" ") ?? s.secret) : null;
  return (
    <main className="wrap">
      <h1>Ikki bosqichli kirishni sozlash</h1>
      <section className="card">
        {s && (
          <ol className="steps">
            <li>Telefoningizga Google Authenticator (yoki shunga o‘xshash) ilovasini o‘rnating.</li>
            <li>Ilovada “+” → “QR kodni skanerlash”ni tanlang va quyidagi kodni skanerlang.</li>
            <li>Ilova ko‘rsatgan 6 xonali kodni pastga yozing.</li>
          </ol>
        )}
        {svg && <div className="qr" role="img" aria-label="Ilova uchun QR kod" dangerouslySetInnerHTML={{ __html: svg }} />}
        {s && <p className="hint">Skanerlab bo‘lmasa, kalitni qo‘lda kiriting:</p>}
        {grouped && <p className="secret" data-testid="totp-secret">{grouped}</p>}
        <SetupForm done={done} />
      </section>
    </main>
  );
}
