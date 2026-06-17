export type UserRole = "FREE" | "VIP" | "ADMIN";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  vipExpiry: string | null;
  createdAt: string;
  profileUpdatedAt?: string | null;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  poster: string;
  trailer: string | null;
  streamUrl: string | null;
  streamingLinks: string[];
  downloadLinks: string[];
  vipDownloadLinks: string | null;
  vipOnly: boolean;
  featured: boolean;
  genres: string[];
  year: number | null;
  rating: number | null;
  duration: string | null;
  watchCount: number;
  contentType: "MOVIE" | "SERIES";
  subtitles: SubtitleTrack[];
  interpreted: boolean;
  interpreters: string[];
  createdAt: string;
}

export interface SubtitleTrack {
  label: string;
  language: string;
  url: string;
}

export interface Episode {
  id: number;
  movieId: number;
  season: number;
  episodeNumber: number;
  title: string;
  description: string | null;
  streamUrl: string | null;
  downloadUrl: string | null;
  thumbnail: string | null;
  duration: string | null;
  vipOnly: boolean;
  subtitles: SubtitleTrack[] | null;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  videoUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  movieId: number | null;
  active: boolean;
  orderIndex: number;
}

export interface Section {
  id: number;
  title: string;
  movieIds: number[];
  orderIndex: number;
  enabled: boolean;
  sectionType: string | null;
  movies?: Movie[];
}

export interface Payment {
  id: number;
  userId: number;
  amount: number;
  status: string;
  provider: string;
  plan: string | null;
  transactionId: string | null;
  paymentRef?: string;
  createdAt: string;
}

export interface Interpreter {
  id: number;
  name: string;
  bio: string | null;
  photo: string | null;
}

export interface DashboardStats {
  totalUsers: number;
  vipUsers: number;
  freeUsers: number;
  totalMovies: number;
  vipMovies: number;
  totalWatches: number;
  recentPayments: Payment[];
  topMovies: Movie[];
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  vipMonthlyPrice: number;
  vipYearlyPrice: number;
}

export interface JwtPayload {
  userId: number;
  role: UserRole;
  twoFaPending?: boolean;
}
