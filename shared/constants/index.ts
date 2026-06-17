export const APP_NAME = "Feelms";
export const APP_TAGLINE = "Your favorite streaming platform";
export const APP_DESCRIPTION =
  "Stream the latest movies, series, and exclusive VIP content on Feelms — Africa's premier streaming platform.";

export const SITE_URL = process.env.VITE_SITE_URL ?? "https://feelms.test";
export const ADMIN_URL = process.env.VITE_ADMIN_URL ?? "https://admin.feelms.test";
export const API_URL = process.env.VITE_API_URL ?? "https://api.feelms.test";

export const VIP_PLANS = {
  monthly: { label: "Monthly", price: 5000, currency: "RWF", duration: "1 month" },
  yearly: { label: "Yearly", price: 50000, currency: "RWF", duration: "1 year" },
} as const;

export const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Anime",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
] as const;

export const CONTENT_TYPES = ["MOVIE", "SERIES"] as const;

export const USER_ROLES = ["FREE", "VIP", "ADMIN"] as const;

export const VIDEO_QUALITIES = [
  "180p",
  "360p",
  "480p",
  "720p",
  "1080p",
  "4K",
  "8K",
] as const;

export const OTP_EXPIRY_MINUTES = 10;
export const TOKEN_EXPIRY_DAYS = 30;
export const TEMP_TOKEN_EXPIRY_MINUTES = 15;
export const PROFILE_UPDATE_COOLDOWN_DAYS = 7;
