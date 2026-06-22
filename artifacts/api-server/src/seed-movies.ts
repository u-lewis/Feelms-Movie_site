import { db, moviesTable, bannersTable, sectionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const MOVIES = [
  // ACTION
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    genres: ["Action", "Drama", "Thriller"],
    year: 2008, rating: 9.0, duration: "2h 32m", vipOnly: false, featured: true,
  },
  {
    title: "Mad Max: Fury Road",
    description: "In a post-apocalyptic wasteland, Max teams up with a mysterious woman, Furiosa, to flee from a cult leader and his army in a lethal road chase.",
    poster: "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",
    trailer: "https://www.youtube.com/watch?v=hEJnMQG9ev8",
    genres: ["Action", "Adventure", "Sci-Fi"],
    year: 2015, rating: 8.1, duration: "2h 00m", vipOnly: false, featured: true,
  },
  {
    title: "John Wick",
    description: "An ex-hitman comes out of retirement to track down the gangsters who killed his dog and took his car, a final gift from his recently deceased wife.",
    poster: "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
    trailer: "https://www.youtube.com/watch?v=2AUmvWm5ZDQ",
    genres: ["Action", "Thriller", "Crime"],
    year: 2014, rating: 7.4, duration: "1h 41m", vipOnly: false, featured: false,
  },
  {
    title: "Top Gun: Maverick",
    description: "After more than thirty years of service as one of the Navy's top aviators, Pete Mitchell is still pushing the envelope.",
    poster: "https://image.tmdb.org/t/p/w500/62HCnUTHjWTObPnSn7B8Rl9e49y.jpg",
    trailer: "https://www.youtube.com/watch?v=qSqVVswa420",
    genres: ["Action", "Drama", "Adventure"],
    year: 2022, rating: 8.3, duration: "2h 11m", vipOnly: false, featured: true,
  },
  {
    title: "Mission: Impossible – Fallout",
    description: "Ethan Hunt and his IMF team, along with some familiar allies, race against time after a mission gone wrong.",
    poster: "https://image.tmdb.org/t/p/w500/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg",
    trailer: "https://www.youtube.com/watch?v=wb49-oV0F78",
    genres: ["Action", "Adventure", "Thriller"],
    year: 2018, rating: 7.7, duration: "2h 27m", vipOnly: false, featured: false,
  },
  // SCI-FI
  {
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    trailer: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    genres: ["Sci-Fi", "Action", "Thriller"],
    year: 2010, rating: 8.8, duration: "2h 28m", vipOnly: true, featured: true,
  },
  {
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIe.jpg",
    trailer: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    year: 2014, rating: 8.7, duration: "2h 49m", vipOnly: true, featured: true,
  },
  {
    title: "Dune",
    description: "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset while its heir becomes troubled by visions of a dark future.",
    poster: "https://image.tmdb.org/t/p/w500/d5NXSklpcuveIZdjGB5WbQSTIZ4.jpg",
    trailer: "https://www.youtube.com/watch?v=8g18jFHCLXk",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    year: 2021, rating: 8.0, duration: "2h 35m", vipOnly: false, featured: true,
  },
  {
    title: "Arrival",
    description: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
    poster: "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
    trailer: "https://www.youtube.com/watch?v=IsomZhBKMDI",
    genres: ["Sci-Fi", "Drama", "Mystery"],
    year: 2016, rating: 7.9, duration: "1h 56m", vipOnly: false, featured: false,
  },
  {
    title: "The Matrix",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    trailer: "https://www.youtube.com/watch?v=vKQi3bBA1y8",
    genres: ["Sci-Fi", "Action", "Thriller"],
    year: 1999, rating: 8.7, duration: "2h 16m", vipOnly: false, featured: false,
  },
  // DRAMA
  {
    title: "The Shawshank Redemption",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    trailer: "https://www.youtube.com/watch?v=NmzuHjWmXOc",
    genres: ["Drama", "Crime"],
    year: 1994, rating: 9.3, duration: "2h 22m", vipOnly: false, featured: true,
  },
  {
    title: "Parasite",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    trailer: "https://www.youtube.com/watch?v=5xH0HfJHsaY",
    genres: ["Drama", "Thriller", "Comedy"],
    year: 2019, rating: 8.5, duration: "2h 12m", vipOnly: true, featured: true,
  },
  {
    title: "Joker",
    description: "A gritty character study of Arthur Fleck, a man disregarded by society, and his transformation into the Joker.",
    poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    trailer: "https://www.youtube.com/watch?v=zAGVQLHvwOY",
    genres: ["Drama", "Thriller", "Crime"],
    year: 2019, rating: 8.4, duration: "2h 02m", vipOnly: false, featured: false,
  },
  {
    title: "Whiplash",
    description: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    poster: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    trailer: "https://www.youtube.com/watch?v=7d_jQycdQGo",
    genres: ["Drama", "Music"],
    year: 2014, rating: 8.5, duration: "1h 47m", vipOnly: false, featured: false,
  },
  // HORROR
  {
    title: "Get Out",
    description: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.",
    poster: "https://image.tmdb.org/t/p/w500/tFXcEccSjH1cJBWXkZOx3OcMFdi.jpg",
    trailer: "https://www.youtube.com/watch?v=DzfpyUB60YY",
    genres: ["Horror", "Mystery", "Thriller"],
    year: 2017, rating: 7.7, duration: "1h 44m", vipOnly: false, featured: false,
  },
  {
    title: "A Quiet Place",
    description: "In a post-apocalyptic world, a family is forced to live in near silence while hiding from monsters that hunt by sound.",
    poster: "https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg",
    trailer: "https://www.youtube.com/watch?v=WR7cc5t7tv8",
    genres: ["Horror", "Sci-Fi", "Drama"],
    year: 2018, rating: 7.5, duration: "1h 30m", vipOnly: false, featured: false,
  },
  {
    title: "Hereditary",
    description: "A grieving family is haunted by tragic and disturbing occurrences after the death of their secretive grandmother.",
    poster: "https://image.tmdb.org/t/p/w500/p_xFiMhp7bEL3MKCgpFhV4bkh5I.jpg",
    trailer: "https://www.youtube.com/watch?v=V6wWKNij_1M",
    genres: ["Horror", "Drama", "Mystery"],
    year: 2018, rating: 7.3, duration: "2h 07m", vipOnly: false, featured: false,
  },
  {
    title: "IT Chapter One",
    description: "In the summer of 1989, a group of bullied kids band together to destroy a shape-shifting monster, which disguises itself as a clown and preys on the children of Derry.",
    poster: "https://image.tmdb.org/t/p/w500/9E2y5Q7WlCVNEhP5GkVComRqn3X.jpg",
    trailer: "https://www.youtube.com/watch?v=FnCdOQsX5kc",
    genres: ["Horror", "Drama"],
    year: 2017, rating: 7.3, duration: "2h 15m", vipOnly: false, featured: false,
  },
  // COMEDY
  {
    title: "The Grand Budapest Hotel",
    description: "A writer encounters the owner of an aging European hotel between the wars and learns of his early years serving as a lobby boy in the hotel's glorious years.",
    poster: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    trailer: "https://www.youtube.com/watch?v=1Fg5iWmQjwk",
    genres: ["Comedy", "Drama", "Adventure"],
    year: 2014, rating: 8.1, duration: "1h 39m", vipOnly: false, featured: false,
  },
  {
    title: "Knives Out",
    description: "A detective investigates the death of a patriarch of an eccentric, combative family.",
    poster: "https://image.tmdb.org/t/p/w500/pThyQovXQrpS44ojUwwjHGtYTBl.jpg",
    trailer: "https://www.youtube.com/watch?v=qGqiHJTsRkQ",
    genres: ["Comedy", "Drama", "Mystery"],
    year: 2019, rating: 8.0, duration: "2h 10m", vipOnly: false, featured: false,
  },
  {
    title: "Superbad",
    description: "Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry.",
    poster: "https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerMFQM.jpg",
    trailer: "https://www.youtube.com/watch?v=9Obun0JfheU",
    genres: ["Comedy"],
    year: 2007, rating: 7.6, duration: "1h 53m", vipOnly: false, featured: false,
  },
  // ROMANCE
  {
    title: "La La Land",
    description: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    trailer: "https://www.youtube.com/watch?v=0pdqf4P9MB8",
    genres: ["Romance", "Drama", "Music"],
    year: 2016, rating: 8.0, duration: "2h 08m", vipOnly: false, featured: false,
  },
  {
    title: "Crazy Rich Asians",
    description: "This contemporary romantic comedy, based on a global bestseller, follows native New Yorker Rachel Chu to Singapore to meet her boyfriend's family.",
    poster: "https://image.tmdb.org/t/p/w500/cUsOumCEXXnCkD9fBFKAIPtGj8P.jpg",
    trailer: "https://www.youtube.com/watch?v=6XRuEVkHm_k",
    genres: ["Romance", "Comedy", "Drama"],
    year: 2018, rating: 6.9, duration: "2h 00m", vipOnly: false, featured: false,
  },
  // THRILLER
  {
    title: "Gone Girl",
    description: "With his wife's disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him when it's suspected that he may not be innocent.",
    poster: "https://image.tmdb.org/t/p/w500/fSRb7vyIP8rQpL055GSuNnvqOmT.jpg",
    trailer: "https://www.youtube.com/watch?v=a4H1NMJBhRk",
    genres: ["Thriller", "Drama", "Mystery"],
    year: 2014, rating: 8.1, duration: "2h 29m", vipOnly: false, featured: false,
  },
  {
    title: "Prisoners",
    description: "When Keller Dover's daughter and her friend go missing, he takes matters into his own hands as the police pursue multiple leads.",
    poster: "https://image.tmdb.org/t/p/w500/iCYyNrVHQDnGZ5ETK0KNKUA2kIL.jpg",
    trailer: "https://www.youtube.com/watch?v=VLRxSQGzBQ8",
    genres: ["Thriller", "Drama", "Crime"],
    year: 2013, rating: 8.1, duration: "2h 33m", vipOnly: false, featured: false,
  },
  {
    title: "Seven",
    description: "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.",
    poster: "https://image.tmdb.org/t/p/w500/6yoghtyIpsGajLD4UTzSAkQmMoN.jpg",
    trailer: "https://www.youtube.com/watch?v=znmZoVkCjpI",
    genres: ["Thriller", "Crime", "Drama"],
    year: 1995, rating: 8.6, duration: "2h 07m", vipOnly: false, featured: false,
  },
  // ANIMATION
  {
    title: "Spirited Away",
    description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
    poster: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    trailer: "https://www.youtube.com/watch?v=ByXuk9QqQkk",
    genres: ["Animation", "Adventure", "Fantasy"],
    year: 2001, rating: 9.3, duration: "2h 05m", vipOnly: true, featured: true,
  },
  {
    title: "Spider-Man: Into the Spider-Verse",
    description: "Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.",
    poster: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
    trailer: "https://www.youtube.com/watch?v=tg52up16eq0",
    genres: ["Animation", "Action", "Adventure"],
    year: 2018, rating: 8.4, duration: "1h 57m", vipOnly: false, featured: false,
  },
  {
    title: "Coco",
    description: "Aspiring musician Miguel, confronted with his family's ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather.",
    poster: "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
    trailer: "https://www.youtube.com/watch?v=Ga6RYejo6Hk",
    genres: ["Animation", "Adventure", "Family"],
    year: 2017, rating: 8.4, duration: "1h 45m", vipOnly: false, featured: false,
  },
  {
    title: "Your Name",
    description: "Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?",
    poster: "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg",
    trailer: "https://www.youtube.com/watch?v=xU47nhruN-Q",
    genres: ["Animation", "Romance", "Fantasy"],
    year: 2016, rating: 8.4, duration: "1h 47m", vipOnly: false, featured: false,
  },
  // CRIME
  {
    title: "Pulp Fiction",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    trailer: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
    genres: ["Crime", "Drama", "Thriller"],
    year: 1994, rating: 8.9, duration: "2h 34m", vipOnly: true, featured: true,
  },
  {
    title: "Goodfellas",
    description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.",
    poster: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    trailer: "https://www.youtube.com/watch?v=qo5jJpHtI1Y",
    genres: ["Crime", "Drama"],
    year: 1990, rating: 8.7, duration: "2h 26m", vipOnly: false, featured: false,
  },
  {
    title: "No Country for Old Men",
    description: "Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and more than two million dollars in cash near the Rio Grande.",
    poster: "https://image.tmdb.org/t/p/w500/6KMXE2cnHAITunPmTBQa1RXpjzQ.jpg",
    trailer: "https://www.youtube.com/watch?v=38A__WT3-o0",
    genres: ["Crime", "Drama", "Thriller"],
    year: 2007, rating: 8.1, duration: "2h 02m", vipOnly: false, featured: false,
  },
  // FANTASY / ADVENTURE
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    description: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
    poster: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
    trailer: "https://www.youtube.com/watch?v=_nZdgFD8ySQ",
    genres: ["Fantasy", "Adventure", "Drama"],
    year: 2001, rating: 8.8, duration: "3h 28m", vipOnly: true, featured: true,
  },
  {
    title: "Pan's Labyrinth",
    description: "In the Falangist Spain of 1944, the bookish young stepdaughter of a sadistic army officer escapes into an eerie but captivating fantasy world.",
    poster: "https://image.tmdb.org/t/p/w500/oHlfm6BpJtlF5KBkArSSHFWBzTI.jpg",
    trailer: "https://www.youtube.com/watch?v=nHcFZSMWDLY",
    genres: ["Fantasy", "Drama", "Adventure"],
    year: 2006, rating: 8.2, duration: "1h 58m", vipOnly: false, featured: false,
  },
  {
    title: "Avatar",
    description: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
    poster: "https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
    trailer: "https://www.youtube.com/watch?v=5PSNL1qE6VY",
    genres: ["Adventure", "Fantasy", "Action"],
    year: 2009, rating: 7.8, duration: "2h 42m", vipOnly: false, featured: false,
  },
  {
    title: "Raiders of the Lost Ark",
    description: "In 1936, archaeologist and adventurer Indiana Jones is hired by the U.S. government to find the Ark of the Covenant before the Nazis.",
    poster: "https://image.tmdb.org/t/p/w500/ceG9VzoRAVGwivFU403Wc3AHRys.jpg",
    trailer: "https://www.youtube.com/watch?v=0KSOMA3QBU0",
    genres: ["Adventure", "Action"],
    year: 1981, rating: 8.4, duration: "1h 55m", vipOnly: false, featured: false,
  },
  // ANIME
  {
    title: "Demon Slayer: Mugen Train",
    description: "Tanjiro Kamado and his comrades embark on a new mission on the Mugen Train, where they must stop a demon from devouring the souls of everyone on board.",
    poster: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYZ4oMlSkMY3MM.jpg",
    trailer: "https://www.youtube.com/watch?v=P2muPNf_yq8",
    genres: ["Anime", "Action", "Fantasy"],
    year: 2020, rating: 8.3, duration: "1h 57m", vipOnly: false, featured: false,
  },
  {
    title: "Akira",
    description: "A secret military project endangers Neo-Tokyo when it turns a biker gang member into a rampaging psychic superhuman who can only be stopped by two teenagers and a group of psychics.",
    poster: "https://image.tmdb.org/t/p/w500/xpA56IflSqkBg3pDsVLDfnNHq7v.jpg",
    trailer: "https://www.youtube.com/watch?v=ZEwdYNlrmDQ",
    genres: ["Anime", "Sci-Fi", "Action"],
    year: 1988, rating: 8.0, duration: "2h 04m", vipOnly: false, featured: false,
  },
  // DOCUMENTARY
  {
    title: "Free Solo",
    description: "A portrait of free solo climber Alex Honnold as he prepares to climb the face of El Capitan with no ropes or safety equipment.",
    poster: "https://image.tmdb.org/t/p/w500/45MnexdFDtF04bE3h5BMVT9SXCM.jpg",
    trailer: "https://www.youtube.com/watch?v=urRVZ4SW7WU",
    genres: ["Documentary", "Adventure"],
    year: 2018, rating: 8.2, duration: "1h 40m", vipOnly: false, featured: false,
  },
];

const BANNERS = [
  {
    title: "The Dark Knight",
    subtitle: "When Gotham needs a hero, he rises.",
    image: "https://image.tmdb.org/t/p/w1280/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
    ctaText: "Watch Now",
    ctaLink: "/movies",
    active: true, orderIndex: 0,
  },
  {
    title: "Dune",
    subtitle: "The spice must flow.",
    image: "https://image.tmdb.org/t/p/w1280/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg",
    ctaText: "Explore",
    ctaLink: "/movies?genre=Sci-Fi",
    active: true, orderIndex: 1,
  },
  {
    title: "Inception",
    subtitle: "Your mind is the scene of the crime.",
    image: "https://image.tmdb.org/t/p/w1280/s2bT29y0ngXxxu2IA8AOzzXTRhd.jpg",
    ctaText: "Watch VIP",
    ctaLink: "/vip",
    active: true, orderIndex: 2,
  },
  {
    title: "Spirited Away",
    subtitle: "A magical world awaits.",
    image: "https://image.tmdb.org/t/p/w1280/bSXfU4dwZyBA1vMmXvejdRXBvuF.jpg",
    ctaText: "Watch Now",
    ctaLink: "/movies?genre=Animation",
    active: true, orderIndex: 3,
  },
  {
    title: "Interstellar",
    subtitle: "Mankind was born on Earth. It was never meant to die here.",
    image: "https://image.tmdb.org/t/p/w1280/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    ctaText: "Watch VIP",
    ctaLink: "/vip",
    active: true, orderIndex: 4,
  },
  {
    title: "La La Land",
    subtitle: "Here's to the fools who dream.",
    image: "https://image.tmdb.org/t/p/w1280/qLmdjn2fv0FV2Mh4NBzMArdA0Uu.jpg",
    ctaText: "Watch Now",
    ctaLink: "/movies?genre=Romance",
    active: true, orderIndex: 5,
  },
  {
    title: "Parasite",
    subtitle: "Act like you own the place.",
    image: "https://image.tmdb.org/t/p/w1280/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
    ctaText: "Watch Now",
    ctaLink: "/movies?genre=Drama",
    active: true, orderIndex: 6,
  },
  {
    title: "Mad Max: Fury Road",
    subtitle: "What a lovely day.",
    image: "https://image.tmdb.org/t/p/w1280/phszHPFzNM4BkNFMdMZoTbOHMfJ.jpg",
    ctaText: "Watch Now",
    ctaLink: "/movies?genre=Action",
    active: true, orderIndex: 7,
  },
  {
    title: "Top Gun: Maverick",
    subtitle: "Feel the need. The need for speed.",
    image: "https://image.tmdb.org/t/p/w1280/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg",
    ctaText: "Watch Now",
    ctaLink: "/movies",
    active: true, orderIndex: 8,
  },
  {
    title: "Pulp Fiction",
    subtitle: "You will know my name is the Lord.",
    image: "https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    ctaText: "Watch VIP",
    ctaLink: "/vip",
    active: true, orderIndex: 9,
  },
];

const SECTIONS = [
  { title: "Action & Adventure", genres: ["Action", "Adventure"], orderIndex: 0 },
  { title: "Sci-Fi Universe", genres: ["Sci-Fi"], orderIndex: 1 },
  { title: "Crime & Thriller", genres: ["Crime", "Thriller"], orderIndex: 2 },
  { title: "Drama Picks", genres: ["Drama"], orderIndex: 3 },
  { title: "Horror & Mystery", genres: ["Horror", "Mystery"], orderIndex: 4 },
  { title: "Animated Worlds", genres: ["Animation", "Anime"], orderIndex: 5 },
  { title: "Comedy Night", genres: ["Comedy"], orderIndex: 6 },
];

export async function seedMoviesData() {
  const existing = await db.select().from(moviesTable).limit(1);
  if (existing.length > 0) { console.log("[seed] Movies already exist, skipping"); return; }
  for (const movie of MOVIES) {
    const existing = await db.select({ id: moviesTable.id })
      .from(moviesTable)
      .where(eq(moviesTable.title, movie.title));
    if (existing.length > 0) continue;

    await db.insert(moviesTable).values({
      title: movie.title,
      description: movie.description,
      poster: movie.poster,
      trailer: movie.trailer,
      genres: movie.genres,
      year: movie.year,
      rating: movie.rating,
      duration: movie.duration,
      vipOnly: movie.vipOnly,
      featured: movie.featured,
      contentType: "MOVIE",
      streamingLinks: [],
      downloadLinks: [],
    });
    console.log(`[seed] Movie inserted: ${movie.title}`);
  }
}

export async function seedBannersData() {
  const existing = await db.select().from(bannersTable).limit(1);
  if (existing.length > 0) { console.log("[seed] Banners already exist, skipping"); return; }
  const existing = await db.select().from(bannersTable).limit(1);
  if (existing.length > 0) { console.log("[seed] Banners already exist, skipping"); return; }
  const existing = await db.select({ id: bannersTable.id }).from(bannersTable);
  if (existing.length > 0) return;

  for (const banner of BANNERS) {
    await db.insert(bannersTable).values(banner);
    console.log(`[seed] Banner inserted: ${banner.title}`);
  }
}

export async function seedSectionsData() {
  const existing = await db.select().from(sectionsTable).limit(1);
  if (existing.length > 0) { console.log("[seed] Sections already exist, skipping"); return; }
  const existing = await db.select().from(sectionsTable).limit(1);
  if (existing.length > 0) { console.log("[seed] Sections already exist, skipping"); return; }
  const allMovies = await db.select({ id: moviesTable.id, genres: moviesTable.genres })
    .from(moviesTable);

  for (const section of SECTIONS) {
    const existingSection = await db.select({ id: sectionsTable.id })
      .from(sectionsTable)
      .where(eq(sectionsTable.title, section.title));
    if (existingSection.length > 0) continue;

    const matchingMovieIds = allMovies
      .filter(m => (m.genres ?? []).some(g => section.genres.includes(g)))
      .map(m => m.id);

    if (matchingMovieIds.length === 0) continue;

    await db.insert(sectionsTable).values({
      title: section.title,
      movieIds: matchingMovieIds.slice(0, 30),
      orderIndex: section.orderIndex,
      enabled: true,
    });
    console.log(`[seed] Section inserted: ${section.title} (${matchingMovieIds.length} movies)`);
  }
}
