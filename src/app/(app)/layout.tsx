export const dynamic = "force-dynamic";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

function AppNav() {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-border-subtle bg-surface/90 backdrop-blur-xl">
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-sm">
              S
            </div>
            <span className="text-lg font-bold tracking-tight">Simvado</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/dashboard"
              className="text-text-secondary hover:text-text-primary transition"
            >
              Dashboard
            </Link>
            <Link
              href="/simulations"
              className="text-text-secondary hover:text-text-primary transition"
            >
              Simulations
            </Link>
          </div>
        </div>
        <UserButton
          appearance={{
            elements: { avatarBox: "h-8 w-8" },
          }}
        />
      </nav>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <AppNav />
      <main className="mx-auto max-w-7xl px-6 pt-20 pb-12">{children}</main>
    </div>
  );
}
