import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/next";
import { LoginForm } from "../forms";

export default async function Page({ searchParams }: { searchParams: Promise<{ parol?: string }> }) {
  if (await currentUser()) redirect("/");
  const { parol } = await searchParams;
  return (
    <main className="wrap">
      <h1>Admin panelga kirish</h1>
      {parol === "1" && <div className="ok" role="status">Parol o‘zgartirildi. Yangi parol bilan kiring.</div>}
      <section className="card"><LoginForm /></section>
      <p className="hint">Ro‘yxatdan o‘tish yo‘q. Hisobni administrator yaratadi.</p>
    </main>
  );
}
