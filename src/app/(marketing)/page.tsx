export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import AnimatedHero from "./components/AnimatedHero";
import SimulationShowcase from "./components/SimulationShowcase";
import AnimatedFeatures from "./components/AnimatedFeatures";
import AnimatedHowItWorks from "./components/AnimatedHowItWorks";
import StudioCTA from "./components/StudioCTA";
import FinalCTA from "./components/FinalCTA";

export default async function HomePage() {
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

  const showcaseData = simulations.map((sim) => ({
    slug: sim.slug,
    title: sim.title,
    category: sim.category,
    difficulty: sim.difficulty,
    description: sim.description,
    thumbnailUrl: sim.thumbnailUrl,
    moduleCount: sim.modules.length,
    estimatedDurationMin: sim.estimatedDurationMin,
  }));

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
