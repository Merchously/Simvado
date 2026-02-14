import Link from "next/link";
import { requireOrgAdmin } from "@/lib/org";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export default async function OrgLayout({ params, children }: Props) {
  const { slug } = await params;
  const { org } = await requireOrgAdmin(slug);

  const navItems = [
    { label: "Dashboard", href: `/org/${slug}` },
    { label: "Members", href: `/org/${slug}/members` },
    { label: "Assignments", href: `/org/${slug}/assignments` },
    { label: "Analytics", href: `/org/${slug}/analytics` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{org.name}</h1>
        <p className="text-sm text-text-muted capitalize">{org.plan} plan</p>
      </div>

      <nav className="flex gap-1 border-b border-border-subtle pb-px">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition rounded-t-lg hover:bg-surface-raised"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
