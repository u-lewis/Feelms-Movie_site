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
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    fetch(`${API}/api/friendly`)
      .then(r => r.json())
      .then(data => setSites(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (sites.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    const speed = 0.8;

    function animate() {
      if (!pausedRef.current && track) {
        posRef.current += speed;
        const half = track.scrollWidth / 2;
        if (posRef.current >= half) posRef.current = 0;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [sites]);

  if (sites.length === 0) return null;

  const doubled = [...sites, ...sites];

  return (
    <div className="py-6">
      <h2 className="text-white font-bold text-lg mb-4 px-4">Watch More On</h2>
      <div className="overflow-hidden"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}>
        <div ref={trackRef} className="flex gap-4 w-max">
          {doubled.map((site, i) => (
            <a key={`${site.id}-${i}`}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 relative w-56 h-32 rounded-2xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all hover:scale-[1.02] group">
              <img src={site.image} alt={site.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                <span className="text-white font-bold text-sm">{site.name}</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/50 group-hover:text-primary transition-colors" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
