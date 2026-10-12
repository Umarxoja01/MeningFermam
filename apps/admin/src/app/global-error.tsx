"use client";
import "./admin.css";

// Ildiz layout'idagi xato uchun (o'z <html> bilan). Inline uslub yo'q (CSP).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="uz">
      <body>
        <main className="wrap">
          <h1>Nimadir xato ketdi</h1>
          <div className="alert" role="alert"><p>Sahifa ochilmadi. Qayta urinib ko‘ring.</p></div>
          <button className="btn" type="button" onClick={() => reset()}>Qayta urinish</button>
        </main>
      </body>
    </html>
  );
}
