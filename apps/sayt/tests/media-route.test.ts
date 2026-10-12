import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const png = new Uint8Array(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6VcwAAAAASUVORK5CYII=", "base64"));
const checksum = createHash("sha256").update(png).digest("hex");
const apiUrl = "http://localhost:3200/api/site-content";
const request = () => new Request(`http://localhost:3100/media/${checksum}`);
const params = (id = checksum) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "");
  vi.stubEnv("CMS_API_URL", apiUrl);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("media yo‘lining statik va dinamik rejimi", () => {
  it("statik eksport uchun bitta yo‘l bor; DB yoki API chaqirilmaydi", async () => {
    vi.stubEnv("CMS_MODE", "");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const route = await import("../src/app/media/[id]/route");
    expect(route.generateStaticParams?.()).toEqual([{ id: "unavailable" }]);
    expect((await route.GET(request(), params())).status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("dinamik rejimda statik generator yo‘q; qoralama rasm 404", async () => {
    vi.stubEnv("CMS_MODE", "dynamic");
    const fetch = vi.fn().mockResolvedValue(new Response("Rasm topilmadi", { status: 404 }));
    vi.stubGlobal("fetch", fetch);
    const route = await import("../src/app/media/[id]/route");
    expect(route.generateStaticParams).toBeUndefined();
    expect((await route.GET(request(), params())).status).toBe(404);
    expect(fetch).toHaveBeenCalledWith(new URL(`/api/public-media/${checksum}`, apiUrl), expect.objectContaining({ cache: "no-store" }));
  });
  it("nashrdagi rasm 200 va asl baytlar bilan qaytadi", async () => {
    vi.stubEnv("CMS_MODE", "dynamic");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(png, { headers: { "Content-Type": "image/png" } })));
    const route = await import("../src/app/media/[id]/route");
    const response = await route.GET(request(), params());
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(png);
  });
  it("noto‘g‘ri ID tashqi so‘rovga olib kelmaydi", async () => {
    vi.stubEnv("CMS_MODE", "dynamic");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const route = await import("../src/app/media/[id]/route");
    expect((await route.GET(request(), params("../bad"))).status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("API boshqa baytlar qaytarsa xesh tekshiruvi uni ko‘rsatmaydi", async () => {
    vi.stubEnv("CMS_MODE", "dynamic");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("buzilgan", { headers: { "Content-Type": "image/png" } })));
    const route = await import("../src/app/media/[id]/route");
    expect((await route.GET(request(), params())).status).toBe(503);
  });
});
