import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap">
      <h1>Sahifa topilmadi</h1>
      <Link className="btn" href="/">Bosh ekran</Link>
    </main>
  );
}
