import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Simvado",
  description:
    "Flexible pricing for individuals, teams, and enterprises. Start free.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Try Module 1 of Boardroom Under Pressure. No card required.",
    features: [
      "1 full simulation module",
      "5-axis scorecard",
      "AI-generated debrief",
      "Peer comparison",
    ],
    cta: "Start Free",
    href: "/sign-up",
    featured: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    description: "Full access to every published simulation.",
    features: [
      "All simulation modules",
      "Unlimited replays",
      "Full debrief history",
      "Priority new releases",
      "Progress dashboard",
    ],
    cta: "Get Started",
    href: "/sign-up",
    featured: true,
    annual: "$699/year (save 26%)",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description:
      "Seat management, analytics, SSO, and custom simulations for your org.",
    features: [
      "Everything in Pro",
      "Team seat management",
      "Enterprise analytics dashboard",
      "Exportable reports (PDF/CSV)",
      "SSO (SAML/OIDC)",
      "Custom simulation development",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    href: "mailto:julius@simvado.com",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-brand-400 mb-3 tracking-wide uppercase">
            Pricing
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Start free. Scale when ready.
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
            Every plan includes AI-powered debriefs and 5-axis scoring.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                tier.featured
                  ? "border-brand-600 bg-surface-raised shadow-xl shadow-brand-600/10 relative"
                  : "border-border-subtle bg-surface-raised"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-600 text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && (
                  <span className="text-text-muted text-sm">{tier.period}</span>
                )}
              </div>
              {"annual" in tier && tier.annual && (
                <p className="mt-1 text-xs text-brand-400">{tier.annual}</p>
              )}
              <p className="mt-3 text-sm text-text-muted">{tier.description}</p>

              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <svg
                      className="h-4 w-4 mt-0.5 text-brand-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={`mt-8 block text-center py-3 rounded-xl text-sm font-semibold transition ${
                  tier.featured
                    ? "bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/25"
                    : "border border-border-default text-text-secondary hover:text-text-primary hover:border-brand-600/50"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise pilot callout */}
        <div className="mt-16 max-w-3xl mx-auto rounded-2xl border border-border-subtle bg-surface-raised p-8 text-center">
          <h3 className="text-xl font-semibold">Enterprise Pilot Program</h3>
          <p className="mt-2 text-sm text-text-muted max-w-lg mx-auto">
            Try Simvado with up to 25 team members for 90 days. Includes
            onboarding, a dedicated usage report, and full access to all
            published simulations. Starting at $12,500.
          </p>
          <Link
            href="mailto:julius@simvado.com"
            className="mt-6 inline-block px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition"
          >
            Request a Pilot
          </Link>
        </div>
      </div>
    </section>
  );
}
