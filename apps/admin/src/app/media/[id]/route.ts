import { authCtx, requireUser } from "@/lib/auth/next";
import { getImage, imageResponse } from "@/lib/media/service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(["admin", "editor"]);
  const { db } = await authCtx();
  const { id } = await params;
  const image = await getImage({ db }, user, id);
  if (!image) return new Response("Rasm topilmadi", { status: 404 });
  return imageResponse(image);
}
