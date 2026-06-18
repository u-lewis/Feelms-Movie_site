import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Search, LogOut, User as UserIcon, Settings,
  Film, Swords, Rocket, Ghost, Laugh, Sparkles, Heart, Zap, Tv,
  Clapperboard, Menu, X, Home, BookOpen, Flame, Languages,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GENRES = [
  { label: "Action",     slug: "Action",     icon: Swords },
  { label: "Sci-Fi",     slug: "Sci-Fi",     icon: Rocket },
  { label: "Drama",      slug: "Drama",      icon: BookOpen },
  { label: "Horror",     slug: "Horror",     icon: Ghost },
  { label: "Comedy",     slug: "Comedy",     icon: Laugh },
  { label: "Animation",  slug: "Animation",  icon: Sparkles },
  { label: "Romance",    slug: "Romance",    icon: Heart },
  { label: "Thriller",   slug: "Thriller",   icon: Flame },
  { label: "Anime",      slug: "Anime",      icon: Zap },
];

export function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = () => setMobileOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/90 backdrop-blur-lg">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/" onClick={close} className="flex items-center shrink-0">
              <img src="/logo.png" alt="Feelms" className="h-11 w-auto" />
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/movies"
              className="p-2 rounded text-white/60 hover:text-white hover:bg-white/6 transition-colors">
              <Search className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Open menu"
              className="flex items-center justify-center w-10 h-10 rounded bg-white/8 hover:bg-white/14 active:scale-95 transition-all text-white"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen
                  ? <motion.span key="x"
                      initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.18 }}>
                      <X className="w-5 h-5" />
                    </motion.span>
                  : <motion.span key="ham"
                      initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.18 }}>
                      <Menu className="w-5 h-5" />
                    </motion.span>
                }
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
              onClick={close}
            />

            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-[70] w-[280px] max-w-[90vw] flex flex-col bg-background/98 backdrop-blur-2xl border-r border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/8 shrink-0">
                <img src="/logo.png" alt="Feelms" className="h-9 w-auto" />
                <button onClick={close} className="w-8 h-8 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 scrollbar-hide">
                <DrawerLink href="/" icon={<Home className="w-4 h-4" />} label="Home" active={location === "/"} onClick={close} />
                <DrawerLink href="/movies" icon={<Film className="w-4 h-4" />} label="Movies" active={location === "/movies" && !location.includes("?")} onClick={close} />
                <DrawerLink href="/movies?type=series" icon={<Clapperboard className="w-4 h-4" />} label="Series" active={false} onClick={close} />
                <DrawerLink href="/interpreted" icon={<Languages className="w-4 h-4" />} label="Interpreted" active={location === "/interpreted"} onClick={close} />
                <DrawerLink href="/tv" icon={<Tv className="w-4 h-4" />} label="Live TV" active={location === "/tv"} onClick={close} />

                <div className="pt-4 pb-2 px-3">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/30">Browse by Genre</p>
                </div>
                {GENRES.map(g => {
                  const Icon = g.icon;
                  return (
                    <DrawerLink
                      key={g.slug}
                      href={`/movies?genre=${encodeURIComponent(g.slug)}`}
                      icon={<Icon className="w-4 h-4" />}
                      label={g.label}
                      active={false}
                      onClick={close}
                    />
                  );
                })}
              </div>

              <div className="shrink-0 px-4 py-4 border-t border-white/8 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-2 mb-1">
                      <div className="w-9 h-9 rounded bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                        <UserIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-white/40 truncate">{user?.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link href="/admin" onClick={close} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded text-white/70 hover:text-white hover:bg-white/6 text-sm transition-colors">
                        <Settings className="w-4 h-4 shrink-0" /> Admin
                      </Link>
                    )}
                    <Link href="/profile" onClick={close} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded text-white/70 hover:text-white hover:bg-white/6 text-sm transition-colors">
                      <UserIcon className="w-4 h-4 shrink-0" /> Profile
                    </Link>
                    <button onClick={() => { logout(); close(); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded text-red-400 hover:bg-red-500/10 text-sm transition-colors">
                      <LogOut className="w-4 h-4 shrink-0" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full rounded text-sm bg-primary hover:bg-primary/90 text-white font-bold">
                      <Link href="/login" onClick={close}>Sign In</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full rounded text-sm border-white/20 text-white hover:bg-white/10 font-bold">
                      <Link href="/register" onClick={close}>Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function DrawerLink({
  href, icon, label, active, onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-bold tracking-tight transition-colors ${
        active
          ? "text-primary bg-primary/10"
          : "text-white/70 hover:text-white hover:bg-white/6"
      }`}>
      <span className="shrink-0">{icon}</span>
      {label}
    </Link>
  );
}