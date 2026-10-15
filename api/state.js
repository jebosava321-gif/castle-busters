const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const KEY = "castle-busters";
const EMPTY = { names: Array(8).fill(""), sc: Array.from({ length: 7 }, () => [0, 0]), videos: [], startedAt: null, finishedAt: null, champs: [] };

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  return r.json();
}

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
  const num = (v) => { const n = Number(v); return v && Number.isFinite(n) ? n : null; };
  const champs = (Array.isArray(s.champs) ? s.champs : []).slice(-200)
    .map((c) => ({ name: String((c && c.name) || "").slice(0, 20), t: Number(c && c.t) || 0, id: String((c && c.id) || "").slice(0, 40), k: num(c && c.k) }))
    .filter((c) => c.name);
  return { names, sc, videos, startedAt: num(s.startedAt), finishedAt: num(s.finishedAt), champs };
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") {
    if (!URL_ || !TOKEN) return res.status(200).json(EMPTY);
    try {
      const r = await redis(["GET", KEY]);
      return res.status(200).json(r.result ? JSON.parse(r.result) : EMPTY);
    } catch (e) { return res.status(200).json(EMPTY); }
  }
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const expected = process.env.ADMIN_PASSWORD;
  const given = req.headers["x-admin-password"] || "";
  if (!expected || given !== expected) return res.status(401).json({ ok: false, error: "unauthorized" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body) return res.status(400).json({ ok: false });

  if (body.action === "login") {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME, preset = process.env.CLOUDINARY_UPLOAD_PRESET;
    return res.status(200).json({ ok: true, cfg: cloud && preset ? { cloud, preset } : null });
  }
  if (body.action === "save") {
    if (!URL_ || !TOKEN) return res.status(500).json({ ok: false, error: "storage_not_configured" });
    let st; try { st = clean(body.state); } catch (e) { st = null; }
    if (!st) return res.status(400).json({ ok: false, error: "invalid" });
    try { await redis(["SET", KEY, JSON.stringify(st)]); } catch (e) { return res.status(500).json({ ok: false, error: "storage_error" }); }
    return res.status(200).json({ ok: true });
  }
  return res.status(400).json({ ok: false });
};
