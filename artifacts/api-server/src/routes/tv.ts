import { Router, type IRouter } from "express";
import { Readable } from "stream";

const router: IRouter = Router();

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Accept": "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Connection": "keep-alive",
  "Pragma": "no-cache",
  "Cache-Control": "no-cache",
};

const TIMEOUT_MS = 12_000;

function makeProxyUrl(raw: string): string {
  return `/api/tv/proxy?url=${encodeURIComponent(raw)}`;
}

function resolveUrl(base: string, relative: string): string {
  try {
    if (relative.startsWith("http://") || relative.startsWith("https://")) return relative;
    if (relative.startsWith("//")) return "https:" + relative;
    return new URL(relative, base).href;
  } catch {
    const basePath = base.substring(0, base.lastIndexOf("/") + 1);
    return basePath + relative;
  }
}

function isM3U8Url(url: string, ct: string): boolean {
  const u = url.split("?")[0].toLowerCase();
  return u.endsWith(".m3u8") || u.endsWith(".m3u")
    || ct.includes("mpegurl") || ct.includes("x-mpegurl") || ct.includes("vnd.apple.mpegurl");
}

function rewriteM3U8(text: string, finalUrl: string): string {
  return text.split("\n").map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    // Rewrite URI="..." attributes inside tag lines (#EXT-X-KEY, #EXT-X-MAP, #EXT-X-MEDIA, etc.)
    if (trimmed.startsWith("#")) {
      return line.replace(/URI="([^"]+)"/g, (_, uri) => {
        if (uri.startsWith("data:")) return `URI="${uri}"`;
        const abs = resolveUrl(finalUrl, uri);
        return `URI="${makeProxyUrl(abs)}"`;
      });
    }

    // Non-comment lines are URLs (segment .ts, child .m3u8, etc.)
    const abs = resolveUrl(finalUrl, trimmed);
    return makeProxyUrl(abs);
  }).join("\n");
}

router.options("/tv/proxy", (_req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Range, Origin, Content-Type");
  res.sendStatus(204);
});

router.get("/tv/proxy", async (req, res): Promise<void> => {
  const raw = req.query.url as string | undefined;
  if (!raw) { res.status(400).json({ error: "url required" }); return; }

  let decoded: string;
  try { decoded = decodeURIComponent(raw); }
  catch { res.status(400).json({ error: "invalid url" }); return; }

  // Validate it's a real URL
  try { new URL(decoded); }
  catch { res.status(400).json({ error: "bad url" }); return; }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Vary", "Origin");

  try {
    const upstream = await fetch(decoded, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        ...HEADERS,
        "Referer": new URL(decoded).origin + "/",
        "Origin": new URL(decoded).origin,
      },
    });
    clearTimeout(timer);

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `upstream ${upstream.status}` });
      return;
    }

    // Use the FINAL URL after redirects for correct relative URL resolution
    const finalUrl: string = (upstream as any).url ?? decoded;
    const ct = upstream.headers.get("content-type") || "";

    if (isM3U8Url(finalUrl, ct) || isM3U8Url(decoded, ct)) {
      // M3U8 playlist — rewrite all URLs to go through proxy
      const text = await upstream.text();

      // Sanity-check it's actually an m3u8 (not a 200 HTML error page)
      if (!text.includes("#EXTM3U") && !text.includes("#EXTINF") && !text.includes("#EXT-X-")) {
        res.status(502).json({ error: "not a valid m3u8" });
        return;
      }

      const rewritten = rewriteM3U8(text, finalUrl);
      res.set("Content-Type", "application/vnd.apple.mpegurl; charset=utf-8");
      res.set("Cache-Control", "no-cache, no-store");
      res.send(rewritten);
    } else {
      // Binary segment (.ts, .aac, .mp4 fragment, key) — stream through directly
      const segCt = ct || "video/mp2t";
      res.set("Content-Type", segCt);
      res.set("Cache-Control", "public, max-age=3600");

      const cl = upstream.headers.get("content-length");
      if (cl) res.set("Content-Length", cl);

      if (upstream.body) {
        // Stream without buffering — critical for low-latency live TV
        Readable.fromWeb(upstream.body as any).pipe(res);
      } else {
        const buf = await upstream.arrayBuffer();
        res.send(Buffer.from(buf));
      }
    }
  } catch (err: any) {
    clearTimeout(timer);
    if (res.headersSent) return;
    if (err?.name === "AbortError") {
      res.status(504).json({ error: "upstream timeout" });
    } else {
      res.status(502).json({ error: "upstream error", detail: String(err?.message ?? "") });
    }
  }
});

export default router;
