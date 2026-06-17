import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Search, LogOut, User as UserIcon, Settings, ChevronDown,
  Film, Swords, Rocket, Ghost, Laugh, Sparkles, Heart, Zap, Tv,
  Clapperboard, Menu, X, Home, BookOpen, Flame, Languages,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
      {/* ── NAV BAR ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/90 backdrop-blur-lg">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LEFT: Logo + desktop links */}
          <div className="flex items-center gap-5">
            <Link href="/" onClick={close} className="flex items-center shrink-0">
              <img src="/logo.png" alt="Feelms" className="h-11 w-auto" />
            </Link>

            {/* Desktop nav — hidden below lg */}
            <div className="hidden lg:flex items-center gap-0.5">
              <Link href="/"
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${location === "/" ? "text-white bg-white/8" : "text-white/60 hover:text-white hover:bg-white/6"}`}>
                Home
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${location.startsWith("/movies") ? "text-white bg-white/8" : "text-white/60 hover:text-white hover:bg-white/6"}`}>
                    Browse <ChevronDown className="w-3.5 h-3.5 opacity-50 ml-0.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-card/95 backdrop-blur-xl border-white/10 p-1.5">
                  <DropdownMenuItem asChild>
                    <Link href="/movies" className="cursor-pointer flex items-center gap-2 text-white/70 hover:text-white px-2 py-1.5 rounded-lg">
                      <Film className="w-3.5 h-3.5 opacity-60" /> All Movies
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/movies?type=series" className="cursor-pointer flex items-center gap-2 text-white/70 hover:text-white px-2 py-1.5 rounded-lg">
                      <Clapperboard className="w-3.5 h-3.5 opacity-60" /> Series
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/8 my-1" />
                  {GENRES.map(g => {
                    const Icon = g.icon;
                    return (
                      <DropdownMenuItem key={g.slug} asChild>
                        <Link href={`/movies?genre=${encodeURIComponent(g.slug)}`} className="cursor-pointer flex items-center gap-2 text-white/70 hover:text-white px-2 py-1.5 rounded-lg">
                          <Icon className="w-3.5 h-3.5 opacity-60" /> {g.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/interpreted"
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${location === "/interpreted" ? "text-white bg-white/8" : "text-white/60 hover:text-white hover:bg-white/6"}`}>
                <Languages className="w-3.5 h-3.5" /> Interpreted
              </Link>

              <Link href="/tv"
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${location === "/tv" ? "text-white bg-white/8" : "text-white/60 hover:text-white hover:bg-white/6"}`}>
                <Tv className="w-3.5 h-3.5" /> Live TV
              </Link>
            </div>
          </div>

          {/* RIGHT: Search + admin menu (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search — always visible */}
            <Link href="/movies"
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/6 transition-colors">
              <Search className="w-5 h-5" />
            </Link>

            {/* Desktop admin dropdown — only shown when logged in as admin */}
            <div className="hidden lg:flex items-center gap-1.5">
              {isAuthenticated && isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 bg-white/10 hover:bg-white/15">
                      <UserIcon className="w-4 h-4 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-card/95 backdrop-blur-xl border-white/8">
                    <div className="px-3 py-2 border-b border-white/8">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-white/40 truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer text-white/70 hover:text-white flex items-center gap-2 mt-1">
                        <Settings className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/8" />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* ── HAMBURGER — always visible below lg ── */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Open menu"
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/8 hover:bg-white/14 active:scale-95 transition-all text-white"
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

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm lg:hidden"
              onClick={close}
            />

            {/* Drawer panel — slides from right */}
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[300px] max-w-[90vw] flex flex-col bg-background/98 backdrop-blur-2xl border-l border-white/10 shadow-2xl lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/8 shrink-0">
                <img src="/logo.png" alt="Feelms" className="h-9 w-auto" />
                <button onClick={close} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable nav section */}
              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">

                <DrawerLink href="/" icon={<Home className="w-4 h-4" />} label="Home" active={location === "/"} onClick={close} />
                <DrawerLink href="/movies" icon={<Film className="w-4 h-4" />} label="All Movies" active={location === "/movies" && !location.includes("?")} onClick={close} />
                <DrawerLink href="/movies?type=series" icon={<Clapperboard className="w-4 h-4" />} label="Series" active={false} onClick={close} />
                <DrawerLink href="/interpreted" icon={<Languages className="w-4 h-4" />} label="Interpreted" active={location === "/interpreted"} onClick={close} />
                <DrawerLink href="/tv" icon={<Tv className="w-4 h-4" />} label="Live TV" active={location === "/tv"} onClick={close} />

                {/* Genre section */}
                <div className="pt-3 pb-1.5 px-3">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/25">Browse by genre</p>
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

              {/* Admin footer — only shown when logged in as admin */}
              {isAuthenticated && isAdmin && (
                <div className="shrink-0 px-4 py-4 border-t border-white/8 space-y-2">
                  <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/4 mb-1">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ring-1 ring-primary/30">
                      <UserIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-white/35 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link href="/admin" onClick={close}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/6 text-sm transition-colors">
                    <Settings className="w-4 h-4 shrink-0" /> Admin Dashboard
                  </Link>
                  <button onClick={() => { logout(); close(); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-colors">
                    <LogOut className="w-4 h-4 shrink-0" /> Logout
                  </button>
                </div>
              )}
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-primary/15 text-white border border-primary/20"
          : "text-white/65 hover:text-white hover:bg-white/6"
      }`}>
      <span className="shrink-0 opacity-75">{icon}</span>
      {label}
    </Link>
  );
}
