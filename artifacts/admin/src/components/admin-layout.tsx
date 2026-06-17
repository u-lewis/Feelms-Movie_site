import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  LayoutDashboard,
  Film,
  Image,
  Layers,
  Users,
  Languages,
  LogOut,
  Shield,
  Settings,
  BarChart3,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Movies & Series", href: "/movies", icon: Film },
  { label: "Hero Banners", href: "/banners", icon: Image },
  { label: "Sections", href: "/sections", icon: Layers },
  { label: "Users", href: "/users", icon: Users },
  { label: "Interpreters", href: "/interpreters", icon: Languages },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
        active
          ? "bg-primary/15 text-primary border border-primary/20"
          : "text-white/60 hover:text-white hover:bg-white/6"
      )}
    >
      <Icon className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "text-white/40 group-hover:text-white/70")} />
      <span className="flex-1">{item.label}</span>
      {active && <ChevronRight className="w-3.5 h-3.5 text-primary/60" />}
    </Link>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">Feelms Admin</p>
            <p className="text-[10px] text-white/35 font-mono uppercase tracking-wider">Control Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
          return <NavLink key={item.href} item={item} active={active} onClick={onNavClick} />;
        })}
      </nav>

      <div className="shrink-0 px-4 py-4 border-t border-white/8">
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/4 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ring-1 ring-primary/30">
              <span className="text-primary text-xs font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-white/35 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-sidebar border-r border-sidebar-border fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 bg-background/95 backdrop-blur-lg border-b border-white/8">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-white">Feelms Admin</span>
          </div>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/14 text-white transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                key="mobile-sidebar"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border lg:hidden"
              >
                <Sidebar onNavClick={() => setMobileOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
