import { Link } from "wouter";
import { Swords, Rocket, BookOpen, Ghost, Laugh, Sparkles, Heart, Flame, Zap, ShieldAlert, Compass } from "lucide-react";
import { useRef, MouseEvent } from "react";

const GENRES = [
  { label: "Action", icon: Swords },
  { label: "Sci-Fi", icon: Rocket },
  { label: "Drama", icon: BookOpen },
  { label: "Horror", icon: Ghost },
  { label: "Comedy", icon: Laugh },
  { label: "Animation", icon: Sparkles },
  { label: "Romance", icon: Heart },
  { label: "Thriller", icon: Flame },
  { label: "Anime", icon: Zap },
  { label: "Crime", icon: ShieldAlert },
  { label: "Adventure", icon: Compass },
];

export function GenreBanner() {
  const rowRef = useRef<HTMLDivElement>(null);
  let isDown = false;
  let startX: number;
  let scrollLeft: number;

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    isDown = true;
    if (!rowRef.current) return;
    startX = e.pageX - rowRef.current.offsetLeft;
    scrollLeft = rowRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown = false;
  };

  const handleMouseUp = () => {
    isDown = false;
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDown || !rowRef.current) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    rowRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="w-full py-6">
      <div 
        ref={rowRef}
        className="flex overflow-x-auto gap-4 px-4 md:px-8 pb-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {GENRES.map((g) => {
          const Icon = g.icon;
          return (
            <Link 
              key={g.label} 
              href={`/movies?genre=${encodeURIComponent(g.label)}`}
              className="group shrink-0 flex flex-col items-center justify-center gap-2 w-[110px] md:w-[140px] aspect-[16/7] bg-card border-y border-r border-white/5 border-l-4 border-l-primary rounded text-white hover:scale-105 hover:border-l-red-500 hover:shadow-[0_0_15px_rgba(229,9,20,0.3)] transition-all duration-300"
              draggable="false"
            >
              <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors pointer-events-none" />
              <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase pointer-events-none">{g.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}