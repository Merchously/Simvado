"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  score: number;
}

export default function ScoreTrendChart({ data }: { data: DataPoint[] }) {
  if (data.length < 2) return null;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
      <h2 className="text-lg font-semibold mb-4">Score Trend</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
            stroke="rgba(255,255,255,0.1)"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
            stroke="rgba(255,255,255,0.1)"
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
          <Line
            type="monotone"
            dataKey="score"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={{ fill: "#7c3aed", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
