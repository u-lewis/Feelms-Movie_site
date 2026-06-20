import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { AdUnit } from "./ad-unit";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background text-foreground">
      <Navbar />
      <div className="flex flex-1 w-full">
        {/* Main content */}
        <main className="flex-1 w-full min-w-0">{children}</main>

        {/* Right sidebar ad — desktop only */}
        <aside className="hidden xl:flex flex-col items-center gap-6 w-[160px] shrink-0 pt-8 pr-4 sticky top-16 h-fit">
          <AdUnit
            slot="YOUR_VERTICAL_AD_SLOT_ID"
            format="vertical"
            className="w-[160px]"
          />
        </aside>
      </div>
      <Footer />
    </div>
  );
}
