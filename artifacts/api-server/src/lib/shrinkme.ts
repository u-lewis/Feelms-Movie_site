const SHRINKME_API = "https://shrinkme.io/api";
const API_KEY = process.env.SHRINKME_API_KEY ?? "";

export async function shortenUrl(url: string): Promise<string> {
  if (!url || !API_KEY) return url;
  try {
    const res = await fetch(`${SHRINKME_API}?api=${API_KEY}&url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (data.status === "success" && data.shortenedUrl) {
      return data.shortenedUrl;
    }
    return url;
  } catch {
    return url; // fallback to original if shortening fails
  }
}
