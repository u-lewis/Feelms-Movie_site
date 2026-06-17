import { Link } from "wouter";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-6xl font-bold text-primary mb-4">404</p>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-white/40 text-sm mb-8">The page you're looking for doesn't exist in the admin panel.</p>
      <Link href="/" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
}
