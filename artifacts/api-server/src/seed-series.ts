import { db, moviesTable, episodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// A public HLS test stream that reliably works in browsers
const DEMO_STREAM = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const SERIES_DATA = [
  {
    title: "Breaking Bad",
    description: "A high school chemistry teacher turned meth producer partners with a former student to secure his family's future after a terminal cancer diagnosis.",
    poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    trailer: "https://www.youtube.com/watch?v=HhesaQXLuRY",
    genres: ["Crime", "Drama", "Thriller"],
    year: 2008,
    rating: 9.5,
    contentType: "SERIES" as const,
    vipOnly: false,
    featured: true,
    episodes: [
      { season: 1, episodeNumber: 1, title: "Pilot", description: "Walter White, a chemistry teacher, discovers he has terminal lung cancer and turns to making meth.", streamUrl: DEMO_STREAM, duration: "58m" },
      { season: 1, episodeNumber: 2, title: "Cat's in the Bag", description: "Walt and Jesse try to dispose of the bodies left in the RV.", streamUrl: DEMO_STREAM, duration: "48m" },
      { season: 1, episodeNumber: 3, title: "...And the Bag's in the River", description: "Walt struggles with a difficult decision about a captive in the basement.", streamUrl: DEMO_STREAM, duration: "48m" },
      { season: 2, episodeNumber: 1, title: "Seven Thirty-Seven", description: "Jesse and Walt try to raise $737,000 for Walt's cancer treatment.", streamUrl: DEMO_STREAM, duration: "47m" },
      { season: 2, episodeNumber: 2, title: "Down", description: "Jesse hits rock bottom while Walt deals with his medical situation.", streamUrl: DEMO_STREAM, duration: "47m" },
    ],
  },
  {
    title: "Stranger Things",
    description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    trailer: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
    genres: ["Sci-Fi", "Horror", "Drama"],
    year: 2016,
    rating: 8.7,
    contentType: "SERIES" as const,
    vipOnly: false,
    featured: true,
    episodes: [
      { season: 1, episodeNumber: 1, title: "The Vanishing of Will Byers", description: "On his way home from a friend's house, young Will Byers goes missing.", streamUrl: DEMO_STREAM, duration: "47m" },
      { season: 1, episodeNumber: 2, title: "The Weirdo on Maple Street", description: "Lucas, Mike and Dustin try to talk to the girl they found in the woods.", streamUrl: DEMO_STREAM, duration: "55m" },
      { season: 1, episodeNumber: 3, title: "Holly, Jolly", description: "A well-kept secret is revealed and Joyce makes a terrifying discovery.", streamUrl: DEMO_STREAM, duration: "51m" },
      { season: 2, episodeNumber: 1, title: "MADMAX", description: "Will adjusts to life after the Upside Down; mysterious new faces arrive in Hawkins.", streamUrl: DEMO_STREAM, duration: "48m" },
    ],
  },
  {
    title: "Game of Thrones",
    description: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    poster: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
    trailer: "https://www.youtube.com/watch?v=KPLWWIOCOOQ",
    genres: ["Fantasy", "Drama", "Action"],
    year: 2011,
    rating: 9.2,
    contentType: "SERIES" as const,
    vipOnly: true,
    featured: true,
    episodes: [
      { season: 1, episodeNumber: 1, title: "Winter Is Coming", description: "Lord Eddard Stark is asked by King Robert to be the Hand of the King.", streamUrl: DEMO_STREAM, duration: "62m", vipOnly: true },
      { season: 1, episodeNumber: 2, title: "The Kingsroad", description: "With the King's company journeying south, Jon Snow heads north.", streamUrl: DEMO_STREAM, duration: "56m", vipOnly: true },
      { season: 1, episodeNumber: 3, title: "Lord Snow", description: "Jon Snow tries to find his place at Castle Black.", streamUrl: DEMO_STREAM, duration: "58m", vipOnly: true },
      { season: 2, episodeNumber: 1, title: "The North Remembers", description: "The Seven Kingdoms count the cost of the war of the five kings.", streamUrl: DEMO_STREAM, duration: "53m", vipOnly: true },
    ],
  },
  {
    title: "Money Heist",
    description: "A criminal mastermind who goes by 'The Professor' has a plan to pull off the biggest heist in recorded history — to print billions of euros in the Royal Mint of Spain.",
    poster: "https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",
    trailer: "https://www.youtube.com/watch?v=Rb5mkwRpNH8",
    genres: ["Crime", "Drama", "Thriller"],
    year: 2017,
    rating: 8.3,
    contentType: "SERIES" as const,
    vipOnly: false,
    featured: false,
    episodes: [
      { season: 1, episodeNumber: 1, title: "Episode 1", description: "A mysterious criminal known as 'The Professor' recruits eight thieves for a grand heist.", streamUrl: DEMO_STREAM, duration: "44m" },
      { season: 1, episodeNumber: 2, title: "Episode 2", description: "The gang struggles to maintain order inside the Mint.", streamUrl: DEMO_STREAM, duration: "43m" },
      { season: 1, episodeNumber: 3, title: "Episode 3", description: "A hostage creates unexpected complications for the crew.", streamUrl: DEMO_STREAM, duration: "44m" },
      { season: 2, episodeNumber: 1, title: "Episode 1", description: "The heist enters a critical phase as police close in.", streamUrl: DEMO_STREAM, duration: "45m" },
    ],
  },
  {
    title: "The Witcher",
    description: "Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny in a turbulent world where people often prove more wicked than beasts.",
    poster: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg",
    trailer: "https://www.youtube.com/watch?v=ndl7gOFNNik",
    genres: ["Fantasy", "Action", "Adventure"],
    year: 2019,
    rating: 8.2,
    contentType: "SERIES" as const,
    vipOnly: false,
    featured: false,
    episodes: [
      { season: 1, episodeNumber: 1, title: "The End's Beginning", description: "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.", streamUrl: DEMO_STREAM, duration: "60m" },
      { season: 1, episodeNumber: 2, title: "Four Marks", description: "Bullied and overlooked, Yennefer accidentally stumbles upon a rare chance to change her fate.", streamUrl: DEMO_STREAM, duration: "58m" },
      { season: 1, episodeNumber: 3, title: "Betrayer Moon", description: "Geralt is hired by a king to track down his daughter who is secretly a striga.", streamUrl: DEMO_STREAM, duration: "56m" },
      { season: 2, episodeNumber: 1, title: "A Grain of Truth", description: "Reuniting with an old acquaintance, Geralt and Ciri take refuge in Nivellen's manor.", streamUrl: DEMO_STREAM, duration: "62m" },
    ],
  },
];

export async function seedSeriesData() {
  const existing = await db.select().from(moviesTable).limit(1);
  if (existing.length > 0) { console.log("[seed] Series already exist, skipping"); return; }
  for (const series of SERIES_DATA) {
    // Check if already seeded
    const existing = await db.select({ id: moviesTable.id })
      .from(moviesTable)
      .where(eq(moviesTable.title, series.title));

    if (existing.length > 0) continue;

    const { episodes, ...movieData } = series;

    const [movie] = await db.insert(moviesTable).values({
      title: movieData.title,
      description: movieData.description,
      poster: movieData.poster,
      trailer: movieData.trailer,
      genres: movieData.genres,
      year: movieData.year,
      rating: movieData.rating,
      contentType: movieData.contentType,
      vipOnly: movieData.vipOnly,
      featured: movieData.featured,
      streamingLinks: [],
      downloadLinks: [],
    }).returning();

    for (const ep of episodes) {
      await db.insert(episodesTable).values({
        movieId: movie.id,
        season: ep.season,
        episodeNumber: ep.episodeNumber,
        title: ep.title,
        description: ep.description,
        streamUrl: ep.streamUrl,
        duration: ep.duration,
        vipOnly: (ep as any).vipOnly ?? false,
      });
    }

    console.log(`[seed] Series inserted: ${series.title}`);
  }
}
