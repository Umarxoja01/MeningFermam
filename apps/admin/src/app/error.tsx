"use client";
import Link from "next/link";

// Xato yoki internet uzilishi: Next'ning standart sahifasi inline uslub ishlatadi va qat'iy CSP uni bloklaydi —
// shuning uchun o'z sahifamiz (faqat CSS klasslari). Xato tafsiloti foydalanuvchiga ko'rsatilmaydi.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="wrap">
      <h1>Nimadir xato ketdi</h1>
      <div className="alert" role="alert"><p>Amal bajarilmadi. Internet aloqasini tekshirib, qayta urinib ko‘ring. Saqlanmagan o‘zgarishlar sahifada qolgan bo‘lishi mumkin.</p></div>
      <div className="top">
        <button className="btn" type="button" onClick={() => reset()}>Qayta urinish</button>
        <Link className="btn ghost" href="/">Bosh ekran</Link>
      </div>
    </main>
  );
}
