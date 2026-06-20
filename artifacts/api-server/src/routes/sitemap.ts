import { Router, type IRouter } from "express";
import { db, moviesTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

const SITE_URL = process.env.SITE_URL ?? "https://feelms.vercel.app";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  priority: string;
  changefreq: string;
}

router.get("/sitemap.xml", async (_req, res): Promise<void> => {
  const movies = await db.select({
    id: moviesTable.id,
    title: moviesTable.title,
    createdAt: moviesTable.createdAt,
  }).from(moviesTable).orderBy(desc(moviesTable.createdAt)).limit(500);

  const staticUrls: SitemapUrl[] = [
    { loc: SITE_URL, priority: "1.0", changefreq: "daily" },
    { loc: `${SITE_URL}/movies`, priority: "0.9", changefreq: "daily" },
    { loc: `${SITE_URL}/tv`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/interpreted`, priority: "0.7", changefreq: "weekly" },
    { loc: `${SITE_URL}/category/action`, priority: "0.7", changefreq: "weekly" },
    { loc: `${SITE_URL}/category/drama`, priority: "0.7", changefreq: "weekly" },
    { loc: `${SITE_URL}/category/comedy`, priority: "0.7", changefreq: "weekly" },
    { loc: `${SITE_URL}/category/horror`, priority: "0.7", changefreq: "weekly" },
    { loc: `${SITE_URL}/category/sci-fi`, priority: "0.7", changefreq: "weekly" },
    { loc: `${SITE_URL}/category/thriller`, priority: "0.7", changefreq: "weekly" },
    { loc: `${SITE_URL}/category/animation`, priority: "0.7", changefreq: "weekly" },
    { loc: `${SITE_URL}/category/anime`, priority: "0.7", changefreq: "weekly" },
  ];

  const movieUrls: SitemapUrl[] = movies.map((m) => ({
    loc: `${SITE_URL}/movie/${slugify(m.title)}-${m.id}`,
    lastmod: m.createdAt instanceof Date ? m.createdAt.toISOString().split("T")[0] : undefined,
    priority: "0.8",
    changefreq: "monthly",
  }));

  const allUrls = [...staticUrls, ...movieUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(xml);
});

router.get("/robots.txt", (_req, res): void => {
  const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /login/admin
Disallow: /2fa
Sitemap: ${SITE_URL}/api/sitemap.xml
`;
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(content);
});

export default router;
