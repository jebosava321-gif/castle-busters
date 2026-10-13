import { getStore } from "@netlify/blobs";

const EMPTY = { names: Array(8).fill(""), sc: Array.from({ length: 7 }, () => [0, 0]), videos: [] };
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function clean(s) {
  if (!s || !Array.isArray(s.names) || s.names.length !== 8 || !Array.isArray(s.sc) || s.sc.length !== 7) return null;
  const names = s.names.map((n) => String(n || "").slice(0, 20));
  const sc = s.sc.map((p) => {
    if (!Array.isArray(p) || p.length !== 2) throw new Error("bad");
    return p.map((v) => { const n = Number(v); if (!Number.isInteger(n) || n < 0 || n > 3) throw new Error("bad"); return n; });
  });
  const videos = (Array.isArray(s.videos) ? s.videos : []).slice(0, 100)
    .map((v) => ({ kind: v && v.kind === "file" ? "file" : "link", url: String((v && v.url) || "").slice(0, 500), title: String((v && v.title) || "").slice(0, 60) }))
    .filter((v) => /^https?:\/\//i.test(v.url));
  return { names, sc, videos };
}

export default async (req) => {
  const store = getStore("castle-busters");
  if (req.method === "GET") return json((await store.get("state", { type: "json" })) || EMPTY);
  if (req.method !== "POST") return json({ ok: false }, 405);

  const expected = Netlify.env.get("ADMIN_PASSWORD");
  const given = req.headers.get("x-admin-password") || "";
  if (!expected || given !== expected) return json({ ok: false, error: "unauthorized" }, 401);

  let body;
  try { body = await req.json(); } catch { return json({ ok: false }, 400); }

  if (body.action === "login") {
    const cloud = Netlify.env.get("CLOUDINARY_CLOUD_NAME");
    const preset = Netlify.env.get("CLOUDINARY_UPLOAD_PRESET");
    return json({ ok: true, cfg: cloud && preset ? { cloud, preset } : null });
  }
  if (body.action === "save") {
    let st; try { st = clean(body.state); } catch { st = null; }
    if (!st) return json({ ok: false, error: "invalid" }, 400);
    await store.setJSON("state", st);
    return json({ ok: true });
  }
  return json({ ok: false }, 400);
};

export const config = { path: "/api/state" };
