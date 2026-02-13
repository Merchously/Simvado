import Link from "next/link";

/* ─── Hero ─────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-brand-600/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border-default px-4 py-1.5 text-xs text-text-secondary mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
          Now in development &mdash; Early access coming soon
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl mx-auto">
          The Flight Simulator{" "}
          <span className="text-brand-400">for Leadership</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Practice high-stakes decisions in cinematic, AI-powered simulations.
          Measurable. Repeatable. Built for executives, boards, and leaders.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base transition shadow-lg shadow-brand-600/25"
          >
            Request Early Access
          </Link>
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-border-default text-text-secondary hover:text-text-primary hover:border-border-default font-medium text-base transition"
          >
            See How It Works
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: "5", label: "Scoring Dimensions" },
            { value: "7", label: "Scenario Modules" },
            { value: "AI", label: "Powered Debriefs" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-bold text-brand-400">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Flagship Preview ─────────────────────────────── */

function FlagshipPreview() {
  return (
    <section className="py-24 border-t border-border-subtle">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-brand-400 mb-3 tracking-wide uppercase">
            Flagship Simulation
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Boardroom Under Pressure
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">
            Seven cinematic scenarios that put you at the center of the most
            consequential boardroom crises executives face today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              num: "01",
              title: "Activist Investor Showdown",
              desc: "An aggressive investor demands board seats. Defend, negotiate, or concede.",
            },
            {
              num: "02",
              title: "Insider Warning",
              desc: "A whistleblower alleges fraud by the CEO. Investigate, escalate, or suppress.",
            },
            {
              num: "03",
              title: "Crisis Communication",
              desc: "A product failure causes public harm. Choose transparency or legal shelter.",
            },
            {
              num: "04",
              title: "ESG Backlash",
              desc: "An environmental scandal threatens the brand. Divest, spin, or double down.",
            },
            {
              num: "05",
              title: "CEO Succession Crisis",
              desc: "The CEO exits unexpectedly. Internal promotion, external search, or interim.",
            },
            {
              num: "06",
              title: "Cybersecurity Breach",
              desc: "Major data breach with ransom demand. Pay, refuse, or contain quietly.",
            },
          ].map((scenario) => (
            <div
              key={scenario.num}
              className="group rounded-2xl border border-border-subtle bg-surface-raised p-6 hover:border-brand-600/50 transition"
            >
              <span className="text-xs font-mono text-brand-400">
                Module {scenario.num}
              </span>
              <h3 className="mt-2 text-lg font-semibold group-hover:text-brand-300 transition">
                {scenario.title}
              </h3>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">
                {scenario.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─────────────────────────────────────── */

function Features() {
  const features = [
    {
      icon: "🎬",
      title: "Cinematic Simulations",
      description:
        "Video-driven, immersive scenarios with branching narratives. Every decision shapes the story.",
    },
    {
      icon: "🤖",
      title: "AI-Powered NPCs",
      description:
        "Characters react dynamically to your choices. No two playthroughs are the same.",
    },
    {
      icon: "📊",
      title: "5-Axis Scoring",
      description:
        "Measure Financial Impact, Reputational Risk, Ethical Integrity, Stakeholder Confidence, and Long-term Stability.",
    },
    {
      icon: "🧠",
      title: "Personalized Debriefs",
      description:
        "AI-generated coaching that tells you what you did well, what you missed, and how to improve.",
    },
    {
      icon: "🏢",
      title: "Enterprise Analytics",
      description:
        "Track team performance, identify risk blind spots, and export reports across your organization.",
    },
    {
      icon: "⏱️",
      title: "Decision Under Pressure",
      description:
        "Optional timers simulate real boardroom urgency. Make the call before time runs out.",
    },
  ];

  return (
    <section id="features" className="py-24 border-t border-border-subtle">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-brand-400 mb-3 tracking-wide uppercase">
            Platform Features
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Training that feels like the real thing
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border-subtle bg-surface-raised p-8"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Enter the scenario",
      description:
        "You receive a briefing: the company, the crisis, the stakeholders, and the stakes.",
    },
    {
      step: "02",
      title: "Make decisions under pressure",
      description:
        "Face 3–4 decision points with real trade-offs. An optional timer raises the stakes.",
    },
    {
      step: "03",
      title: "Watch consequences unfold",
      description:
        "AI-powered characters react. The boardroom shifts. Your choices compound.",
    },
    {
      step: "04",
      title: "Get your scorecard & debrief",
      description:
        "See your 5-axis score, compare to peers, and receive personalized AI coaching.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-border-subtle">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-brand-400 mb-3 tracking-wide uppercase">
            How It Works
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Four steps to better decisions
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => (
            <div key={item.step} className="relative">
              <div className="text-6xl font-bold text-brand-950 mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ──────────────────────────────────────────── */

function CTA() {
  return (
    <section className="py-24 border-t border-border-subtle">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Ready to train like it matters?
        </h2>
        <p className="mt-4 text-lg text-text-secondary">
          Join the leaders who practice decisions before the stakes are real.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition shadow-lg shadow-brand-600/25"
          >
            Request Early Access
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-border-default text-text-secondary hover:text-text-primary font-medium transition"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ─────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      <Hero />
      <FlagshipPreview />
      <Features />
      <HowItWorks />
      <CTA />
    </>
  );
}
