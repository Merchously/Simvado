export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import AnimatedHero from "./components/AnimatedHero";
import SimulationShowcase from "./components/SimulationShowcase";
import AnimatedFeatures from "./components/AnimatedFeatures";
import AnimatedHowItWorks from "./components/AnimatedHowItWorks";
import StudioCTA from "./components/StudioCTA";
import FinalCTA from "./components/FinalCTA";

const KB3D = (file: string) =>
  `https://kitbash3d.com/cdn/shop/files/${file}`;

const fallbackSimulations = [
  {
    slug: "operation-blackout",
    title: "Operation Blackout",
    category: "Cybersecurity",
    difficulty: "advanced",
    description:
      "A coordinated cyberattack cripples a major financial institution. Lead the incident response through containment, forensic analysis, and recovery.",
    thumbnailUrl: KB3D("CPI_WEB_POSTER_72f41b22-bd95-4e0c-9ed0-cc3fede96d75.png"),
    moduleCount: 4,
    estimatedDurationMin: 90,
  },
  {
    slug: "the-geneva-accord",
    title: "The Geneva Accord",
    category: "Diplomacy",
    difficulty: "executive",
    description:
      "Navigate a high-stakes multilateral summit where competing national interests threaten global stability.",
    thumbnailUrl: KB3D("WDC_WEB_POSTER.png"),
    moduleCount: 4,
    estimatedDurationMin: 120,
  },
  {
    slug: "fault-lines",
    title: "Fault Lines",
    category: "Crisis Management",
    difficulty: "advanced",
    description:
      "A 7.2 magnitude earthquake devastates a major metropolitan area. Coordinate emergency services and make life-or-death triage decisions.",
    thumbnailUrl: KB3D("WRK_WEB_POSTER.png"),
    moduleCount: 4,
    estimatedDurationMin: 80,
  },
  {
    slug: "shadow-market",
    title: "Shadow Market",
    category: "Intelligence",
    difficulty: "advanced",
    description:
      "Lead a multi-agency task force investigating an international arms trafficking network through underground black markets.",
    thumbnailUrl: KB3D("BMK_WEB_POSTER.png"),
    moduleCount: 4,
    estimatedDurationMin: 100,
  },
  {
    slug: "neon-district",
    title: "Neon District",
    category: "Leadership",
    difficulty: "executive",
    description:
      "Govern a sprawling megacity in 2055 where mega-corporations, citizen collectives, and AI systems compete for power.",
    thumbnailUrl: KB3D("BTL_WEB_POSTER.png"),
    moduleCount: 4,
    estimatedDurationMin: 110,
  },
  {
    slug: "rising-sun-protocol",
    title: "Rising Sun Protocol",
    category: "Business",
    difficulty: "intermediate",
    description:
      "Close a critical technology partnership in Tokyo while navigating complex cultural dynamics and competing corporate interests.",
    thumbnailUrl: KB3D("JPN_WEB_POSTER.png"),
    moduleCount: 4,
    estimatedDurationMin: 75,
  },
];

export default async function HomePage() {
  let showcaseData = fallbackSimulations;

  try {
    const simulations = await db.simulation.findMany({
      where: { status: "published" },
      include: {
        modules: {
          where: { status: "published" },
          select: { id: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: 6,
    });

    if (simulations.length > 0) {
      showcaseData = simulations.map((sim) => ({
        slug: sim.slug,
        title: sim.title,
        category: sim.category,
        difficulty: sim.difficulty as string,
        description: sim.description,
        thumbnailUrl: sim.thumbnailUrl ?? "",
        moduleCount: sim.modules.length,
        estimatedDurationMin: sim.estimatedDurationMin ?? 60,
      }));
    }
  } catch {
    // DB unreachable — use fallback data
  }

  return (
    <>
      <AnimatedHero />
      <SimulationShowcase simulations={showcaseData} />
      <AnimatedFeatures />
      <AnimatedHowItWorks />
      <StudioCTA />
      <FinalCTA />
    </>
  );
}
