import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

interface FriendlySite {
  id: number;
  name: string;
  image: string;
  url: string;
}

const API = import.meta.env.VITE_API_URL ?? "";

export function FriendlySites() {
  const [sites, setSites] = useState<FriendlySite[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/api/friendly`)
      .then(r => r.json())
      .then(data => setSites(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Auto scroll
  useEffect(() => {
    if (sites.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;
    let animationId: number;
    let pos = 0;
    const speed = 0.5;

    function animate() {
      pos += speed;
      if (pos >= el!.scrollWidth / 2) pos = 0;
      el!.scrollLeft = pos;
      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);

    // Pause on hover
    const pause = () => cancelAnimationFrame(animationId);
    const resume = () => { animationId = requestAnimationFrame(animate); };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, [sites]);

  if (sites.length === 0) return null;

  // Duplicate for infinite scroll effect
  const doubled = [...sites, ...sites];

  return (
    <div className="py-6 px-4">
      <h2 className="text-white font-bold text-lg mb-4 px-2">Watch More On</h2>
      <div ref={scrollRef} className="flex gap-4 overflow-x-hidden cursor-grab select-none">
        {doubled.map((site, i) => (
          <a key={`${site.id}-${i}`} href={site.url} target="_blank" rel="noopener noreferrer"
            className="shrink-0 relative w-56 h-32 rounded-2xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all hover:scale-[1.02] group">
            <img src={site.image} alt={site.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
              <span className="text-white font-bold text-sm">{site.name}</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/50 group-hover:text-primary transition-colors" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
