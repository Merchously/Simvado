import type { Metadata } from "next";
import { requireStudioMember } from "@/lib/studio";
import CreateSimForm from "./CreateSimForm";

export const metadata: Metadata = {
  title: "New Simulation — Studio — Simvado",
};

type Props = { params: Promise<{ slug: string }> };

export default async function NewSimulationPage({ params }: Props) {
  const { slug } = await params;
  await requireStudioMember(slug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Simulation</h1>
        <p className="text-text-secondary">
          Create a new simulation for your studio
        </p>
      </div>
      <CreateSimForm slug={slug} />
    </div>
  );
}
