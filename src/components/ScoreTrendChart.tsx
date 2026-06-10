"use client";

import { TrendingUp } from "lucide-react";
import type { HistoryEntry } from "@/lib/history";

export function ScoreTrendChart({ history }: { history: HistoryEntry[] }) {
  if (history.length < 2) return (
    <div style={{ background: "#111118", border: "1px solid #2e2e3f", borderRadius: "12px", padding: "2rem", textAlign: "center" }}>
      <TrendingUp size={32} color="#3a3a50" style={{ marginBottom: "12px" }} />
      <p style={{ color: "#65625a", fontSize: "14px", margin: 0 }}>Need at least 2 meetings to show trend. Run more analyses.</p>
    </div>
  );

  const sorted = [...history].reverse(); // oldest first
  const scores = sorted.map(e => e.analysis.accountabilityScore);
  const min = Math.min(...scores) - 10;
  const max = Math.max(...scores) + 10;
  const range = max - min;
  const W = 600, H = 180, PAD = 40;
  const pw = W - PAD * 2;
  const ph = H - PAD * 2;

  function x(i: number) { return PAD + (i / (scores.length - 1)) * pw; }
  function y(s: number) { return PAD + ph - ((s - min) / range) * ph; }

  const points = scores.map((s, i) => `${x(i)},${y(s)}`).join(" ");
  const areaPoints = `${x(0)},${H - PAD} ${points} ${x(scores.length - 1)},${H - PAD}`;

  function scoreColor(s: number) { return s >= 75 ? "#4caf7d" : s >= 50 ? "#d4853a" : "#e05252"; }

  const trend = scores[scores.length - 1] - scores[0];

  return (
    <div style={{ background: "#111118", border: "1px solid #2e2e3f", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "1rem 1.25rem", borderBottom: "1px solid #2e2e3f", background: "#0d0d14" }}>
        <TrendingUp size={16} color="#c9a84c" />
        <span className="font-display" style={{ fontWeight: 700, fontSize: "14px", color: "#f2f0eb" }}>Score trend</span>
        <span style={{
          marginLeft: "auto", padding: "3px 10px", borderRadius: "100px",
          background: trend >= 0 ? "rgba(76,175,125,0.1)" : "rgba(224,82,82,0.1)",
          border: `1px solid ${trend >= 0 ? "#1e4a30" : "#5a2020"}`,
          fontSize: "12px", fontWeight: 600,
          color: trend >= 0 ? "#4caf7d" : "#e05252"
        }}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)} pts over {history.length} meetings
        </span>
      </div>
      <div style={{ padding: "1rem 1.25rem" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[25, 50, 75, 100].map(v => {
            const yv = PAD + ph - ((v - min) / range) * ph;
            if (yv < PAD || yv > H - PAD) return null;
            return (
              <g key={v}>
                <line x1={PAD} y1={yv} x2={W - PAD} y2={yv} stroke="#1a1a24" strokeWidth="1" />
                <text x={PAD - 6} y={yv + 4} textAnchor="end" fill="#3a3a50" fontSize="10">{v}</text>
              </g>
            );
          })}
          {/* Area fill */}
          <polygon points={areaPoints} fill="url(#areaGrad)" />
          {/* Line */}
          <polyline points={points} fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinejoin="round" />
          {/* Dots */}
          {scores.map((s, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(s)} r="5" fill="#0d0d14" stroke={scoreColor(s)} strokeWidth="2" />
              <text x={x(i)} y={y(s) - 10} textAnchor="middle" fill={scoreColor(s)} fontSize="10" fontWeight="700">{s}</text>
              <text x={x(i)} y={H - PAD + 16} textAnchor="middle" fill="#3a3a50" fontSize="9">
                {new Date(sorted[i].savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
