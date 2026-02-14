import { notFound } from "next/navigation";
import { requireStudioMember } from "@/lib/studio";
import { db } from "@/lib/db";
import EditSimForm from "./EditSimForm";

type Props = { params: Promise<{ slug: string; id: string }> };

export default async function StudioEditSimPage({ params }: Props) {
  const { slug, id } = await params;
  const ctx = await requireStudioMember(slug);

  const simulation = await db.simulation.findUnique({
    where: { id },
    include: {
      modules: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!simulation || simulation.studioId !== ctx.studio.id) notFound();

  return (
    <div className="space-y-8">
      {simulation.reviewNotes && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
          <p className="text-sm font-medium text-yellow-400">Review Feedback</p>
          <p className="mt-1 text-sm text-text-secondary">
            {simulation.reviewNotes}
          </p>
        </div>
      )}

      <EditSimForm
        studioSlug={slug}
        simulation={{
          id: simulation.id,
          title: simulation.title,
          slug: simulation.slug,
          description: simulation.description,
          category: simulation.category,
          skillTags: simulation.skillTags,
          difficulty: simulation.difficulty,
          format: simulation.format,
          estimatedDurationMin: simulation.estimatedDurationMin,
          thumbnailUrl: simulation.thumbnailUrl,
          status: simulation.status,
        }}
        modules={simulation.modules.map((m) => ({
          id: m.id,
          title: m.title,
          slug: m.slug,
          sortOrder: m.sortOrder,
          launchUrl: m.launchUrl,
          platform: m.platform,
          buildVersion: m.buildVersion,
          isFreeDemo: m.isFreeDemo,
          estimatedDurationMin: m.estimatedDurationMin,
          status: m.status,
        }))}
      />
    </div>
  );
}
