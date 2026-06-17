export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateMovieSlug(title: string, id: number): string {
  return `${slugify(title)}-${id}`;
}

export function extractIdFromSlug(slug: string): number | null {
  const parts = slug.split("-");
  const id = parseInt(parts[parts.length - 1], 10);
  return isNaN(id) ? null : id;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatCurrency(amount: number, currency = "RWF"): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function buildCategoryUrl(genre: string): string {
  return `/category/${slugify(genre)}`;
}

export function buildMovieUrl(title: string, id: number): string {
  return `/movie/${generateMovieSlug(title, id)}`;
}

export function parseGenreFromCategorySlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
