import pg from "pg";
import fs from "fs";
const { Client } = pg;

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/import-backup.mjs <path-to-backup.json>");
  process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(filePath, "utf-8"));
const { movies = [], episodes = [], banners = [], sections = [], friendly = [] } = backup.data ?? {};

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query("BEGIN");

  console.log("Clearing existing data...");
  await client.query("DELETE FROM episodes");
  await client.query("DELETE FROM banners");
  await client.query("DELETE FROM homepage_sections");
  await client.query("DELETE FROM friendly_sites");
  await client.query("DELETE FROM movies");

  console.log(`Inserting ${movies.length} movies...`);
  for (const m of movies) {
    await client.query(
      `INSERT INTO movies
        (id, title, description, poster, trailer, streaming_links, download_links,
         vip_download_links, vip_only, featured, genres, year, rating, duration,
         watch_count, stream_url, content_type, subtitles, interpreted, interpreters, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [
        m.id, m.title, m.description, m.poster, m.trailer ?? null,
        m.streamingLinks ?? [], m.downloadLinks ?? [], m.vipDownloadLinks ?? null,
        m.vipOnly ?? false, m.featured ?? false, m.genres ?? [], m.year ?? null,
        m.rating ?? null, m.duration ?? null, m.watchCount ?? 0, m.streamUrl ?? null,
        m.contentType ?? "MOVIE", JSON.stringify(m.subtitles ?? []),
        m.interpreted ?? false, m.interpreters ?? [], m.createdAt ?? new Date().toISOString(),
      ]
    );
  }

  console.log(`Inserting ${episodes.length} episodes...`);
  for (const e of episodes) {
    await client.query(
      `INSERT INTO episodes
        (id, movie_id, season, episode_number, title, description, stream_url,
         thumbnail, duration, vip_only, download_url, subtitles, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        e.id, e.movieId, e.season ?? 1, e.episodeNumber, e.title, e.description ?? null,
        e.streamUrl ?? null, e.thumbnail ?? null, e.duration ?? null, e.vipOnly ?? false,
        e.downloadUrl ?? null, JSON.stringify(e.subtitles ?? []), e.createdAt ?? new Date().toISOString(),
      ]
    );
  }

  console.log(`Inserting ${banners.length} banners...`);
  for (const b of banners) {
    await client.query(
      `INSERT INTO banners
        (id, title, subtitle, image, video_url, cta_text, cta_link, movie_id,
         active, order_index, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        b.id, b.title, b.subtitle ?? null, b.image ?? null, b.videoUrl ?? null,
        b.ctaText ?? null, b.ctaLink ?? null, b.movieId ?? null, b.active ?? true,
        b.orderIndex ?? 0, b.createdAt ?? new Date().toISOString(),
      ]
    );
  }

  console.log(`Inserting ${sections.length} sections...`);
  for (const s of sections) {
    await client.query(
      `INSERT INTO homepage_sections
        (id, title, movie_ids, order_index, enabled, section_type, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        s.id, s.title, s.movieIds ?? [], s.orderIndex ?? 0, s.enabled ?? true,
        s.sectionType ?? null, s.createdAt ?? new Date().toISOString(),
      ]
    );
  }

  console.log(`Inserting ${friendly.length} friendly sites...`);
  for (const f of friendly) {
    await client.query(
      `INSERT INTO friendly_sites (id, name, image, url, "order", created_at)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [f.id, f.name, f.image, f.url, f.order ?? 0, f.createdAt ?? new Date().toISOString()]
    );
  }

  console.log("Resetting sequences...");
  const seqTables = [
    ["movies", "movies_id_seq"],
    ["episodes", "episodes_id_seq"],
    ["banners", "banners_id_seq"],
    ["homepage_sections", "homepage_sections_id_seq"],
    ["friendly_sites", "friendly_sites_id_seq"],
  ];
  for (const [table, seq] of seqTables) {
    await client.query(
      `SELECT setval('${seq}', COALESCE((SELECT MAX(id) FROM ${table}), 1))`
    );
  }

  await client.query("COMMIT");
  console.log("\n✅ Import complete.");
  console.log(
    `   movies: ${movies.length}, episodes: ${episodes.length}, banners: ${banners.length}, sections: ${sections.length}, friendly: ${friendly.length}`
  );
} catch (err) {
  await client.query("ROLLBACK");
  console.error("❌ Import failed, rolled back:", err);
  process.exit(1);
} finally {
  await client.end();
}
