import Link from "next/link";
import { requireStudioMember } from "@/lib/studio";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export default async function StudioLayout({ params, children }: Props) {
  const { slug } = await params;
  const { studio } = await requireStudioMember(slug);

  const navItems = [
    { label: "Dashboard", href: `/studio/${slug}` },
    { label: "Simulations", href: `/studio/${slug}/simulations` },
    { label: "API Keys", href: `/studio/${slug}/api-keys` },
    { label: "Team", href: `/studio/${slug}/team` },
    { label: "Earnings", href: `/studio/${slug}/earnings` },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center gap-6 border-b border-border-subtle pb-4">
        <h2 className="text-lg font-bold text-brand-400">{studio.name}</h2>
        <nav className="flex items-center gap-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-text-secondary hover:text-text-primary transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
