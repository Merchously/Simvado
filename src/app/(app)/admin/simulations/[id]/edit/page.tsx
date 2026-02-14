import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import SimulationForm from "./SimulationForm";
import ModuleList from "./ModuleList";

export default async function EditSimulationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const simulation = await db.simulation.findUnique({
    where: { id },
    include: { modules: { orderBy: { sortOrder: "asc" } } },
  });

  if (!simulation) notFound();

  return (
    <div className="space-y-10">
      <SimulationForm simulation={JSON.parse(JSON.stringify(simulation))} />
      <ModuleList
        simulationId={simulation.id}
        modules={JSON.parse(JSON.stringify(simulation.modules))}
      />
    </div>
  );
}
