"use client";

import { ShieldAlert } from "lucide-react";
import type { MeetingAnalysis } from "@/types/meeting";

export function RiskHeatmap({ analysis }: { analysis: MeetingAnalysis }) {
  // Build owner x risk matrix
  const owners = Array.from(new Set(analysis.actionItems.map(i => i.owner)));
  const buckets = ["In Progress", "Blocked", "No Owner", "Planning", "Done"];

  const ownerStats = owners.map(owner => {
    const tasks = analysis.actionItems.filter(i => i.owner === owner);
    const avgRisk = Math.round(tasks.reduce((s, t) => s + t.riskScore, 0) / tasks.length);
    const maxRisk = Math.max(...tasks.map(t => t.riskScore));
    const blocked = tasks.filter(t => t.blockers.length > 0).length;
    const highRisk = tasks.filter(t => t.risk === "high").length;
    return { owner, tasks: tasks.length, avgRisk, maxRisk, blocked, highRisk };
  });

  function heatColor(score: number): string {
    if (score >= 70) return "#e05252";
    if (score >= 40) return "#d4853a";
    if (score >= 20) return "#c9a84c";
    return "#4caf7d";
  }

  function heatBg(score: number): string {
    if (score >= 70) return "rgba(224,82,82,0.12)";
    if (score >= 40) return "rgba(212,133,58,0.12)";
    if (score >= 20) return "rgba(201,168,76,0.1)";
    return "rgba(76,175,125,0.1)";
  }

  return (
    <div style={{ background: "#111118", border: "1px solid #2e2e3f", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "1rem 1.25rem", borderBottom: "1px solid #2e2e3f", background: "#0d0d14" }}>
        <ShieldAlert size={16} color="#c9a84c" />
        <span className="font-display" style={{ fontWeight: 700, fontSize: "14px", color: "#f2f0eb" }}>Risk heatmap</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          {[["Low", "#4caf7d"], ["Medium", "#d4853a"], ["High", "#e05252"]].map(([label, color]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: color as string }} />
              <span style={{ fontSize: "11px", color: "#65625a" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "1rem 1.25rem" }}>
        {/* Grid header */}
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 60px 60px 60px 80px", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
          {["Owner", "Risk bar", "Tasks", "Blocked", "High", "Avg score"].map(h => (
            <span key={h} style={{ fontSize: "10px", fontWeight: 600, color: "#3a3a50", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {ownerStats.map(stat => (
          <div key={stat.owner} style={{
            display: "grid", gridTemplateColumns: "140px 1fr 60px 60px 60px 80px", gap: "8px",
            padding: "10px 12px", borderRadius: "8px", marginBottom: "6px",
            background: heatBg(stat.avgRisk), border: `1px solid ${heatColor(stat.avgRisk)}22`,
            alignItems: "center"
          }}>
            <span className="font-display" style={{ fontWeight: 700, fontSize: "13px", color: "#f2f0eb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {stat.owner}
            </span>
            <div style={{ height: "6px", borderRadius: "3px", background: "#1a1a24", overflow: "hidden" }}>
              <div style={{ width: `${stat.avgRisk}%`, height: "100%", borderRadius: "3px", background: heatColor(stat.avgRisk), transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#f2f0eb" }}>{stat.tasks}</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: stat.blocked > 0 ? "#d4853a" : "#65625a" }}>{stat.blocked}</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: stat.highRisk > 0 ? "#e05252" : "#65625a" }}>{stat.highRisk}</span>
            <span className="font-mono" style={{ fontSize: "13px", fontWeight: 600, color: heatColor(stat.avgRisk) }}>{stat.avgRisk}/100</span>
          </div>
        ))}

        {/* Summary row */}
        <div style={{ marginTop: "12px", padding: "10px 12px", borderRadius: "8px", background: "#0d0d14", border: "1px solid #232330", display: "flex", gap: "20px" }}>
          <div>
            <p style={{ fontSize: "10px", color: "#3a3a50", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 3px" }}>Team avg risk</p>
            <p className="font-display" style={{ fontSize: "1.5rem", fontWeight: 800, color: heatColor(Math.round(ownerStats.reduce((s, o) => s + o.avgRisk, 0) / ownerStats.length)), margin: 0 }}>
              {Math.round(ownerStats.reduce((s, o) => s + o.avgRisk, 0) / ownerStats.length)}<span style={{ fontSize: "12px", color: "#65625a" }}>/100</span>
            </p>
          </div>
          <div>
            <p style={{ fontSize: "10px", color: "#3a3a50", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 3px" }}>Most at risk</p>
            <p className="font-display" style={{ fontSize: "1rem", fontWeight: 700, color: "#e05252", margin: 0 }}>
              {ownerStats.sort((a, b) => b.avgRisk - a.avgRisk)[0]?.owner ?? "—"}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "10px", color: "#3a3a50", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 3px" }}>Most reliable</p>
            <p className="font-display" style={{ fontSize: "1rem", fontWeight: 700, color: "#4caf7d", margin: 0 }}>
              {ownerStats.sort((a, b) => a.avgRisk - b.avgRisk)[0]?.owner ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
