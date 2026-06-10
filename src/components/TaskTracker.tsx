"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { MeetingAnalysis } from "@/types/meeting";

const STORAGE_KEY = "task_completions";

function loadCompletions(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

function saveCompletions(data: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function TaskTracker({ analysis }: { analysis: MeetingAnalysis }) {
  const [completions, setCompletions] = useState<Record<string, boolean>>({});

  useEffect(() => { setCompletions(loadCompletions()); }, []);

  function toggle(id: string) {
    const updated = { ...completions, [id]: !completions[id] };
    setCompletions(updated);
    saveCompletions(updated);
  }

  const done = analysis.actionItems.filter(i => completions[i.id]).length;
  const total = analysis.actionItems.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div style={{ background: "#111118", border: "1px solid #2e2e3f", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "1rem 1.25rem", borderBottom: "1px solid #2e2e3f", background: "#0d0d14" }}>
        <CheckCircle2 size={16} color="#c9a84c" />
        <span className="font-display" style={{ fontWeight: 700, fontSize: "14px", color: "#f2f0eb" }}>Task completion</span>
        <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 600, color: pct === 100 ? "#4caf7d" : "#a8a499" }}>{done}/{total} done</span>
      </div>

      {/* Progress bar */}
      <div style={{ padding: "12px 1.25rem 0" }}>
        <div style={{ height: "6px", borderRadius: "3px", background: "#1a1a24", overflow: "hidden", marginBottom: "4px" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: "3px", background: pct === 100 ? "#4caf7d" : "#c9a84c", transition: "width 0.4s ease" }} />
        </div>
        <p style={{ fontSize: "11px", color: "#65625a", margin: "0 0 12px", textAlign: "right" }}>{pct}% complete</p>
      </div>

      <div style={{ padding: "0 1.25rem 1rem", display: "flex", flexDirection: "column", gap: "6px" }}>
        {analysis.actionItems.map(item => {
          const isDone = !!completions[item.id];
          return (
            <div key={item.id}
              onClick={() => toggle(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                background: isDone ? "rgba(76,175,125,0.05)" : "#0d0d14",
                border: `1px solid ${isDone ? "#1e4a30" : "#232330"}`,
                transition: "all 0.15s", opacity: isDone ? 0.7 : 1
              }}
            >
              {isDone
                ? <CheckCircle2 size={16} color="#4caf7d" style={{ flexShrink: 0 }} />
                : <Circle size={16} color="#3a3a50" style={{ flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "13px", fontWeight: 600, color: isDone ? "#65625a" : "#f2f0eb",
                  margin: "0 0 2px", textDecoration: isDone ? "line-through" : "none",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                }}>{item.task}</p>
                <p style={{ fontSize: "11px", color: "#3a3a50", margin: 0 }}>
                  {item.owner} · {item.dueDate}
                </p>
              </div>
              {!isDone && item.risk === "high" && (
                <span style={{ fontSize: "10px", fontWeight: 600, color: "#e05252", background: "#2a1010", padding: "2px 7px", borderRadius: "3px", flexShrink: 0 }}>HIGH</span>
              )}
              {isDone && (
                <span style={{ fontSize: "10px", fontWeight: 600, color: "#4caf7d", background: "#112a1e", padding: "2px 7px", borderRadius: "3px", flexShrink: 0 }}>✓ DONE</span>
              )}
            </div>
          );
        })}
      </div>

      {pct === 100 && (
        <div style={{ margin: "0 1.25rem 1rem", padding: "10px 12px", borderRadius: "8px", background: "rgba(76,175,125,0.08)", border: "1px solid #1e4a30", textAlign: "center" }}>
          <p className="font-display" style={{ fontWeight: 700, fontSize: "14px", color: "#4caf7d", margin: 0 }}>🎉 All tasks completed!</p>
        </div>
      )}
    </div>
  );
}
