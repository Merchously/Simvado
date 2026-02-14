"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

interface Props {
  completed: number;
  total: number;
}

export default function CompletionRateChart({ completed, total }: Props) {
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const color = rate >= 80 ? "#22c55e" : rate >= 50 ? "#eab308" : "#ef4444";

  const data = [{ name: "Rate", value: rate, fill: color }];

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
      <h2 className="text-lg font-semibold mb-4">Completion Rate</h2>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={180}
            endAngle={0}
            barSize={12}
          >
            <RadialBar
              background={{ fill: "rgba(255,255,255,0.05)" }}
              dataKey="value"
              cornerRadius={6}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center -mt-6">
          <div className="text-center">
            <p className="text-3xl font-bold">{rate}%</p>
            <p className="text-xs text-text-muted">
              {completed}/{total} sessions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
