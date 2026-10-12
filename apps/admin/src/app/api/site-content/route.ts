import { NextResponse } from "next/server";
import { schema } from "@meningfermam/db";
import { and, eq, inArray } from "drizzle-orm";
import { authCtx } from "@/lib/auth/next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Faqat saytda ommaga chiqarilgan qiymatlar; qoralama, foydalanuvchi va sessiya ma'lumotlari olinmaydi. */
export async function GET() {
  try {
    const { db } = await authCtx();
    const { contentItem, contentVersion, publication } = schema;
    const rows = await db.select({ type: contentItem.type, data: contentVersion.data })
      .from(publication)
      .innerJoin(contentItem, eq(contentItem.id, publication.itemId))
      .innerJoin(contentVersion, and(eq(contentVersion.id, publication.versionId), eq(contentVersion.itemId, publication.itemId)))
      .where(and(eq(contentItem.key, "asosiy"), inArray(contentItem.type, ["website", "contacts", "features", "faq"])));
    const result: Record<string, unknown> = {};
    for (const row of rows) result[row.type === "faq" ? "faqGroups" : row.type] = row.data;
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return NextResponse.json({ error: "Nashr kontenti vaqtincha mavjud emas" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
