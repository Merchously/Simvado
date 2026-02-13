import Link from "next/link";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-sm">
        S
      </div>
      <span className="text-xl font-bold tracking-tight">Simvado</span>
    </Link>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-border-subtle bg-surface/80 backdrop-blur-xl">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
            <Link href="#features" className="hover:text-text-primary transition">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-text-primary transition">
              How It Works
            </Link>
            <Link href="/pricing" className="hover:text-text-primary transition">
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-text-secondary hover:text-text-primary transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Page Content */}
      <main className="flex-1 pt-[73px]">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border-subtle">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Logo />
              <p className="mt-4 text-sm text-text-muted max-w-xs">
                The flight simulator for professional leadership.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><Link href="#features" className="hover:text-text-primary transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-text-primary transition">Pricing</Link></li>
                <li><Link href="#how-it-works" className="hover:text-text-primary transition">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><span>About</span></li>
                <li><span>Contact</span></li>
                <li><span>Careers</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><span>Privacy</span></li>
                <li><span>Terms</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border-subtle text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Simvado. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
