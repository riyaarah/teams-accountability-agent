"use client";

import { Clock, Star, Trash2, TrendingUp } from "lucide-react";
import { deleteFromHistory, type HistoryEntry } from "@/lib/history";

export function MeetingHistory({ history, onSelect, onDelete }: {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}) {
  if (!history.length) return (
    <div style={{ background: "#111118", border: "1px solid #2e2e3f", borderRadius: "12px", padding: "2rem", textAlign: "center" }}>
      <Clock size={32} color="#3a3a50" style={{ marginBottom: "12px" }} />
      <p style={{ color: "#65625a", fontSize: "14px", margin: 0 }}>No meeting history yet. Run your first analysis to start tracking.</p>
    </div>
  );

  return (
    <div style={{ background: "#111118", border: "1px solid #2e2e3f", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "1rem 1.25rem", borderBottom: "1px solid #2e2e3f", background: "#0d0d14" }}>
        <Clock size={16} color="#c9a84c" />
        <span className="font-display" style={{ fontWeight: 700, fontSize: "14px", color: "#f2f0eb" }}>Meeting history</span>
        <span style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: "4px", background: "#1a1a24", border: "1px solid #2e2e3f", fontSize: "11px", color: "#65625a" }}>{history.length} saved</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#2e2e3f" }}>
        {history.map(entry => {
          const score = entry.analysis.accountabilityScore;
          const scoreColor = score >= 75 ? "#4caf7d" : score >= 50 ? "#d4853a" : "#e05252";
          return (
            <div key={entry.id} style={{
              background: "#111118", padding: "12px 1.25rem",
              display: "flex", alignItems: "center", gap: "12px", cursor: "pointer",
              transition: "background 0.15s"
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1a1a24")}
              onMouseLeave={e => (e.currentTarget.style.background = "#111118")}
              onClick={() => onSelect(entry)}
            >
              <div style={{
                width: "42px", height: "42px", borderRadius: "8px", flexShrink: 0,
                background: "#0d0d14", border: "1px solid #232330",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <span className="font-display" style={{ fontSize: "15px", fontWeight: 800, color: scoreColor }}>{score}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="font-display" style={{ fontWeight: 700, fontSize: "13px", color: "#f2f0eb", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {entry.analysis.title}
                </p>
                <p style={{ fontSize: "11px", color: "#65625a", margin: 0 }}>
                  {new Date(entry.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {" · "}{entry.analysis.actionItems.length} tasks
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ padding: "3px 8px", borderRadius: "100px", background: "#0d0d14", border: "1px solid #232330", fontSize: "11px", color: scoreColor, fontWeight: 600 }}>
                  {score}/100
                </span>
                <button type="button" onClick={e => { e.stopPropagation(); deleteFromHistory(entry.id); onDelete(entry.id); }}
                  style={{ background: "transparent", border: "none", color: "#3a3a50", cursor: "pointer", padding: "4px", borderRadius: "4px", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#e05252")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#3a3a50")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {history.length >= 2 && (
        <div style={{ padding: "10px 1.25rem", borderTop: "1px solid #2e2e3f", display: "flex", alignItems: "center", gap: "8px" }}>
          <TrendingUp size={14} color="#c9a84c" />
          <span style={{ fontSize: "12px", color: "#65625a" }}>
            Avg score: <span style={{ color: "#f2f0eb", fontWeight: 600 }}>
              {Math.round(history.reduce((s, e) => s + e.analysis.accountabilityScore, 0) / history.length)}/100
            </span>
          </span>
          <span style={{ fontSize: "12px", color: "#65625a", marginLeft: "auto" }}>
            {history.filter(e => e.analysis.accountabilityScore >= 75).length} high-performing meetings
            <Star size={12} color="#c9a84c" style={{ marginLeft: "4px", verticalAlign: "middle" }} />
          </span>
        </div>
      )}
    </div>
  );
}
