import Link from "next/link";
import { authCtx, requireUser } from "@/lib/auth/next";
import { listMedia } from "@/lib/media/service";
import { CopyPath, UploadForm } from "./forms";

export default async function MediaPage() {
  const user = await requireUser(["admin", "editor"]);
  const { db } = await authCtx();
  const assets = await listMedia({ db }, user);
  const rawOrigin = process.env.PUBLIC_SITE_URL?.trim() ?? "";
  let publicOrigin = "";
  try { const url = new URL(rawOrigin); if (["http:", "https:"].includes(url.protocol)) publicOrigin = url.origin; } catch { /* Havola nusxasi env'siz ham ishlaydi. */ }
  return (
    <main className="wrap wide">
      <div className="top"><h1>Rasmlar</h1><Link className="btn ghost" href="/">Boshqaruvga qaytish</Link></div>
      <section className="card"><h2>Yangi rasm</h2><p className="muted">Rasmni yuklang. Havolasini dizayn yoki bo‘limdagi rasm maydoniga nusxalang, keyin o‘zgarishni nashr qiling.</p><UploadForm /></section>
      <section className="card"><h2>Yuklangan rasmlar</h2>
        {assets.length ? <ul className="sections">{assets.map((asset) => <li key={asset.id}>
          <b>{asset.mime.replace("image/", "").toUpperCase()} · {Math.ceil(asset.bytes / 1024)} KB</b>
          <small>{asset.createdAt.toLocaleDateString("uz-UZ", { timeZone: "Asia/Tashkent" })}</small>
          <a href={asset.path} target="_blank" rel="noopener noreferrer">Rasmni ochish</a>
          {publicOrigin && <a href={`${publicOrigin}${asset.path}`} target="_blank" rel="noopener noreferrer">Saytdagi rasmni ochish</a>}
          <CopyPath path={asset.path} publicPath={publicOrigin ? `${publicOrigin}${asset.path}` : undefined} />
        </li>)}</ul> : <p className="muted">Hali rasm yuklanmagan.</p>}
      </section>
    </main>
  );
}
