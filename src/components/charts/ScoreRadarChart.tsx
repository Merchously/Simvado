"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DimensionData {
  dimension: string;
  score: number;
  average: number;
}

export default function ScoreRadarChart({ data }: { data: DimensionData[] }) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
      <h2 className="text-lg font-semibold mb-4">Score Breakdown</h2>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            stroke="rgba(255,255,255,0.1)"
          />
          <Radar
            name="Your Average"
            dataKey="score"
            stroke="#7c3aed"
            fill="#7c3aed"
            fillOpacity={0.3}
          />
          <Radar
            name="Platform Avg"
            dataKey="average"
            stroke="#64748b"
            fill="#64748b"
            fillOpacity={0.1}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(30,30,40,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: 13,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
