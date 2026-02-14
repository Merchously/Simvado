import { requireAdmin } from "@/lib/admin";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div>
      <div className="mb-8 flex items-center gap-6 border-b border-border-subtle pb-4">
        <h2 className="text-lg font-bold text-brand-400">Admin</h2>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/admin"
            className="text-text-secondary hover:text-text-primary transition"
          >
            Overview
          </Link>
          <Link
            href="/admin/simulations"
            className="text-text-secondary hover:text-text-primary transition"
          >
            Simulations
          </Link>
          <Link
            href="/admin/api-keys"
            className="text-text-secondary hover:text-text-primary transition"
          >
            API Keys
          </Link>
          <Link
            href="/admin/organizations"
            className="text-text-secondary hover:text-text-primary transition"
          >
            Organizations
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
