import { authCtx } from "@/lib/auth/next";
import { getPublishedImage, imageResponse } from "@/lib/media/service";

/** Login talab qilmaydi; faqat nashr qilingan sahifalar ishlatgan rasmlar. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{64}$/.test(id)) return new Response("Rasm topilmadi", { status: 404 });
  try {
    const { db } = await authCtx();
    const image = await getPublishedImage({ db }, id);
    return image ? imageResponse(image, true) : new Response("Rasm topilmadi", { status: 404 });
  } catch {
    return new Response("Rasm vaqtincha ochilmadi", { status: 503 });
  }
}
