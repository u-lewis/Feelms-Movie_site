import pg from "pg";
const { Client } = pg;

const banners = [
  { title: "Avengers: Endgame", subtitle: "The epic conclusion to the Infinity Saga. Assemble.", image: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", ctaText: "Watch Now", ctaLink: "/movies/4", active: true, orderIndex: 0 },
  { title: "Inception", subtitle: "Your mind is the scene of the crime.", image: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg", ctaText: "Play Now", ctaLink: "/movies/1", active: true, orderIndex: 1 },
  { title: "Interstellar", subtitle: "Mankind was born on Earth. It was never meant to die here.", image: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg", ctaText: "Watch Now", ctaLink: "/movies/3", active: true, orderIndex: 2 },
  { title: "Oppenheimer", subtitle: "The world forever changes. Now streaming exclusively.", image: "https://image.tmdb.org/t/p/original/nb3qYn3OEtAKsWQiPFXHqzWoKII.jpg", ctaText: "Watch Exclusive", ctaLink: "/movies/16", active: true, orderIndex: 3 },
  { title: "Spider-Man: No Way Home", subtitle: "The multiverse unleashed. No going back.", image: "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg", ctaText: "Play Now", ctaLink: "/movies/10", active: true, orderIndex: 4 },
];

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query("DELETE FROM banners");
let n = 0;
for (const b of banners) {
  await client.query(
    `INSERT INTO banners (title, subtitle, image, cta_text, cta_link, active, order_index)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [b.title, b.subtitle, b.image, b.ctaText, b.ctaLink, b.active, b.orderIndex]
  );
  console.log("  + " + b.title);
  n++;
}
await client.end();
console.log(`\nDone — ${n} banners seeded.`);
