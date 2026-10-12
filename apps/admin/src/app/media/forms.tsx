"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { uploadAction } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn" disabled={pending}>{pending ? "Yuklanmoqda…" : "Rasm yuklash"}</button>;
}

export function CopyPath({ path, publicPath }: { path: string; publicPath?: string }) {
  const [message, setMessage] = useState("");
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); setMessage("Havola nusxalandi."); }
    catch { setMessage("Nusxalash ishlamadi. Havolani maydondan belgilab nusxalang."); }
  };
  return <div className="form"><label className="field">Rasm havolasi<input value={path} readOnly onFocus={(e) => e.currentTarget.select()} /></label>
    <button type="button" className="btn small ghost" onClick={() => copy(path)}>Havolani nusxalash</button>
    {publicPath && <button type="button" className="btn small ghost" onClick={() => copy(publicPath)}>To‘liq manzilni nusxalash</button>}
    {message && <p className="hint" role="status">{message}</p>}</div>;
}

export function UploadForm() {
  const [state, action] = useActionState(uploadAction, null);
  return (
    <form action={action} className="form">
      {state?.error && <p className="alert" role="alert">{state.error}</p>}
      {state?.ok && <p className="ok" role="status">{state.ok}</p>}
      <label className="field">Rasm tanlang<input type="file" name="image" accept="image/png,image/jpeg,image/webp" required />
        <span className="field-help">PNG, JPEG yoki WebP. Eng ko‘p 2 MB.</span></label>
      <Submit />
      {state?.path && <CopyPath path={state.path} />}
    </form>
  );
}
