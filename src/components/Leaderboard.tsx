"use client";

import { Award, ShieldAlert, Trophy, Users } from "lucide-react";
import { buildLeaderboard, type HistoryEntry } from "@/lib/history";

export function Leaderboard({ history }: { history: HistoryEntry[] }) {
  const board = buildLeaderboard(history);

  if (!board.length) return (
    <div style={{ background: "#111118", border: "1px solid #2e2e3f", borderRadius: "12px", padding: "2rem", textAlign: "center" }}>
      <Trophy size={32} color="#3a3a50" style={{ marginBottom: "12px" }} />
      <p style={{ color: "#65625a", fontSize: "14px", margin: 0 }}>Leaderboard builds after multiple meetings. Run more analyses to rank your team.</p>
    </div>
  );

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ background: "#111118", border: "1px solid #2e2e3f", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "1rem 1.25rem", borderBottom: "1px solid #2e2e3f", background: "#0d0d14" }}>
        <Trophy size={16} color="#c9a84c" />
        <span className="font-display" style={{ fontWeight: 700, fontSize: "14px", color: "#f2f0eb" }}>Accountability leaderboard</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#65625a" }}>
          <Users size={12} />{board.length} members
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "2rem 1fr 6rem 6rem 6rem 6rem", gap: "8px", padding: "8px 1.25rem", borderBottom: "1px solid #1a1a24" }}>
        {["#", "Member", "Tasks", "High risk", "Blocked", "Avg risk"].map(h => (
          <span key={h} style={{ fontSize: "10px", fontWeight: 600, color: "#3a3a50", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</span>
        ))}
      </div>

      {board.map((member, i) => {
        const riskColor = member.avgRiskScore >= 60 ? "#e05252" : member.avgRiskScore >= 30 ? "#d4853a" : "#4caf7d";
        return (
          <div key={member.name} style={{
            display: "grid", gridTemplateColumns: "2rem 1fr 6rem 6rem 6rem 6rem", gap: "8px",
            padding: "10px 1.25rem", borderBottom: "1px solid #1a1a24",
            background: i === 0 ? "rgba(201,168,76,0.04)" : "transparent",
            alignItems: "center"
          }}>
            <span style={{ fontSize: "14px" }}>{medals[i] ?? `${i + 1}`}</span>
            <div>
              <p className="font-display" style={{ fontWeight: 700, fontSize: "13px", color: "#f2f0eb", margin: 0 }}>{member.name}</p>
              <p style={{ fontSize: "11px", color: "#65625a", margin: 0 }}>{member.meetings} meeting{member.meetings !== 1 ? "s" : ""}</p>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#f2f0eb" }}>{member.totalTasks}</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: member.highRiskTasks > 0 ? "#e05252" : "#65625a" }}>{member.highRiskTasks}</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: member.blockedTasks > 0 ? "#d4853a" : "#65625a" }}>{member.blockedTasks}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: "#1a1a24" }}>
                <div style={{ width: `${member.avgRiskScore}%`, height: "100%", borderRadius: "2px", background: riskColor, transition: "width 0.5s" }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: riskColor, minWidth: "28px" }}>{member.avgRiskScore}</span>
            </div>
          </div>
        );
      })}

      {board.length > 0 && (
        <div style={{ padding: "10px 1.25rem", display: "flex", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Award size={13} color="#4caf7d" />
            <span style={{ fontSize: "11px", color: "#65625a" }}>Most reliable: <span style={{ color: "#4caf7d", fontWeight: 600 }}>{board[0].name}</span></span>
          </div>
          {board.length > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldAlert size={13} color="#e05252" />
              <span style={{ fontSize: "11px", color: "#65625a" }}>Needs support: <span style={{ color: "#e05252", fontWeight: 600 }}>{board[board.length - 1].name}</span></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
