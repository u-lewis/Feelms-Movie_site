import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Search, LogOut, User as UserIcon, Settings, ChevronDown,
  Film, Swords, Rocket, Ghost, Laugh, Sparkles, Heart, Zap, Tv,
  Clapperboard, Menu, X, Home, BookOpen, Flame, Languages,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const close = () => setMobileOpen(false);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-500 ease-out ${
          scrolled
            ? "bg-background/96 backdrop-blur-2xl border-b border-white/[0.05] shadow-[0_1px_0_rgba(255,255,255,0.03)]"
            : "bg-gradient-to-b from-black/80 via-black/40 to-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-5 h-14 flex items-center justify-between">

          {/* LEFT: Logo + desktop links */}
          <div className="flex items-center gap-6">
            <Link href="/" onClick={close} className="flex items-center shrink-0">
              <img src="/logo.png" alt="Feelms" className="h-9 w-auto" />
            </Link>

            {/* Desktop nav — hidden below lg */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
              <NavLink href="/" active={location === "/"}>Home</NavLink>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`text-sm font-medium px-3.5 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                      location.startsWith("/movies")
                        ? "text-white"
                        : "text-white/55 hover:text-white"
                    }`}
                  >
                    Browse
                    <ChevronDown className="w-3.5 h-3.5 opacity-40 group-data-[state=open]:rotate-180 transition-transform" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-52 bg-[hsl(0_0%_10%)] backdrop-blur-2xl border-white/[0.08] p-1.5 rounded-xl shadow-2xl"
                >
                  <DropdownMenuItem asChild>
                    <Link href="/movies" className="cursor-pointer flex items-center gap-2.5 text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm">
                      <Film className="w-3.5 h-3.5 opacity-50" /> All Movies
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/movies?type=series" className="cursor-pointer flex items-center gap-2.5 text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm">
                      <Clapperboard className="w-3.5 h-3.5 opacity-50" /> Series
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/[0.06] my-1.5" />
                  <div className="px-3 py-1 mb-0.5">
                    <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-white/25">Genres</p>
                  </div>
                  {GENRES.map(g => {
                    const Icon = g.icon;
                    return (
                      <DropdownMenuItem key={g.slug} asChild>
                        <Link
                          href={`/movies?genre=${encodeURIComponent(g.slug)}`}
                          className="cursor-pointer flex items-center gap-2.5 text-white/65 hover:text-white px-3 py-1.5 rounded-lg text-sm"
                        >
                          <Icon className="w-3.5 h-3.5 opacity-50" /> {g.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <NavLink href="/interpreted" active={location === "/interpreted"}>
                Interpreted
              </NavLink>

              <NavLink href="/tv" active={location === "/tv"}>
                Live TV
              </NavLink>
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Link
              href="/movies"
              className="p-2 rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </Link>

            {/* Admin dropdown (desktop) */}
            <div className="hidden lg:flex items-center">
              {isAuthenticated && isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ml-1 flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 hover:bg-primary/30 ring-1 ring-primary/30 transition-all duration-200">
                      <UserIcon className="w-3.5 h-3.5 text-primary" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52 bg-[hsl(0_0%_10%)] backdrop-blur-2xl border-white/[0.08] rounded-xl shadow-2xl"
                  >
                    <div className="px-3 py-2.5 border-b border-white/[0.06]">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-white/35 truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer text-white/65 hover:text-white flex items-center gap-2 mt-1 px-3 py-2 text-sm">
                        <Settings className="w-3.5 h-3.5" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/[0.06]" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10 flex items-center gap-2 px-3 py-2 text-sm"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Open menu"
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] active:scale-95 transition-all text-white ml-1"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen
                  ? <motion.span key="x"
                      initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.15 }}>
                      <X className="w-4.5 h-4.5" />
                    </motion.span>
                  : <motion.span key="ham"
                      initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.15 }}>
                      <Menu className="w-4.5 h-4.5" />
                    </motion.span>
                }
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={close}
            />

            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[290px] max-w-[90vw] flex flex-col bg-[hsl(0_0%_9%)] border-l border-white/[0.07] shadow-2xl lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.07] shrink-0">
                <img src="/logo.png" alt="Feelms" className="h-8 w-auto" />
                <button
                  onClick={close}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                <DrawerLink href="/" icon={<Home className="w-4 h-4" />} label="Home" active={location === "/"} onClick={close} />
                <DrawerLink href="/movies" icon={<Film className="w-4 h-4" />} label="All Movies" active={location === "/movies" && !location.includes("?")} onClick={close} />
                <DrawerLink href="/movies?type=series" icon={<Clapperboard className="w-4 h-4" />} label="Series" active={false} onClick={close} />
                <DrawerLink href="/interpreted" icon={<Languages className="w-4 h-4" />} label="Interpreted" active={location === "/interpreted"} onClick={close} />
                <DrawerLink href="/tv" icon={<Tv className="w-4 h-4" />} label="Live TV" active={location === "/tv"} onClick={close} />

                <div className="pt-4 pb-2 px-3">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/20">Genres</p>
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

              {/* Admin section (only for logged-in admin) */}
              {isAuthenticated && isAdmin && (
                <div className="shrink-0 px-4 py-4 border-t border-white/[0.07] space-y-1.5">
                  <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.04] mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ring-1 ring-primary/25">
                      <UserIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-white/30 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link href="/admin" onClick={close}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.06] text-sm transition-colors">
                    <Settings className="w-3.5 h-3.5 shrink-0" /> Admin Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); close(); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 text-sm transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" /> Sign Out
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

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`relative text-sm font-medium px-3.5 py-1.5 rounded-md transition-all duration-200 ${
        active ? "text-white" : "text-white/55 hover:text-white"
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
      )}
    </Link>
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
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-primary/12 text-white border border-primary/15"
          : "text-white/55 hover:text-white hover:bg-white/[0.05]"
      }`}
    >
      <span className="shrink-0 opacity-60">{icon}</span>
      {label}
    </Link>
  );
}
