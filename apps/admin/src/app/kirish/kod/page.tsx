import { redirect } from "next/navigation";
import { pendingStage } from "@/lib/auth/next";
import { MfaForm } from "../../forms";

export default async function Page() {
  if ((await pendingStage()) !== "mfa") redirect("/kirish");
  return (
    <main className="wrap">
      <h1>Tasdiqlash kodi</h1>
      <p className="muted">Telefoningizdagi ilovani (Google Authenticator va shu kabi) oching va 6 xonali kodni kiriting.</p>
      <section className="card"><MfaForm /></section>
    </main>
  );
}
