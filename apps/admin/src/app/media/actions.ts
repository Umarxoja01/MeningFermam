"use server";
import { revalidatePath } from "next/cache";
import { authCtx, requireUser } from "@/lib/auth/next";
import { MAX_IMAGE_BYTES, uploadImage } from "@/lib/media/service";

export type UploadState = { ok?: string; error?: string; path?: string } | null;

export async function uploadAction(_prev: UploadState, fd: FormData): Promise<UploadState> {
  const user = await requireUser(["admin", "editor"]);
  const file = fd.get("image");
  if (!file || typeof file === "string") return { error: "Avval rasm tanlang." };
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return { error: "Rasm 2 MB dan oshmasligi kerak." };
  const { db } = await authCtx();
  const result = await uploadImage({ db }, user, { bytes: new Uint8Array(await file.arrayBuffer()), mime: file.type });
  if (!result.ok) return { error: result.message };
  revalidatePath("/media");
  return { ok: result.reused ? "Bu rasm avval yuklangan. Mavjud havoladan foydalaning." : "Rasm saqlandi. Havolasini rasm maydoniga qo‘ying.", path: result.asset.path };
}
