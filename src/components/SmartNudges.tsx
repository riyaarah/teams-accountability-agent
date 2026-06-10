"use client";

import { Bell, Copy, MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import type { MeetingAnalysis } from "@/types/meeting";

function generateNudge(task: MeetingAnalysis["actionItems"][0], meetingTitle: string): string {
  const due = task.dueDate === "Needs date" ? "as soon as possible" : `by ${task.dueDate}`;
  const blocker = task.blockers.length > 0 ? ` I noticed there's a blocker: ${task.blockers[0]}. Let me know how I can help unblock you.` : "";
  const risk = task.risk === "high" ? " This is flagged as high priority." : "";

  return `Hi ${task.owner}, just a quick nudge regarding your commitment from **${meetingTitle}**: "${task.task}". This is due ${due}.${risk}${blocker} Please confirm once it's done or flag any issues. Thanks!`;
}

export function SmartNudges({ analysis }: { analysis: MeetingAnalysis }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const atRiskItems = analysis.actionItems.filter(i =>
    i.risk === "high" || i.blockers.length > 0 || i.dueDate === "Needs date" || i.owner === "Unassigned"
  );

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text.replace(/\*\*/g, ""));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div style={{ background: "#111118", border: "1px solid #2e2e3f", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "1rem 1.25rem", borderBottom: "1px solid #2e2e3f", background: "#0d0d14" }}>
        <Bell size={16} color="#c9a84c" />
        <span className="font-display" style={{ fontWeight: 700, fontSize: "14px", color: "#f2f0eb" }}>Smart nudges</span>
        <span style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: "4px", background: "#2a2010", border: "1px solid #4a3520", fontSize: "11px", color: "#d4853a", fontWeight: 600 }}>
          {atRiskItems.length} at-risk tasks
        </span>
      </div>

      {atRiskItems.length === 0 ? (
        <div style={{ padding: "1.5rem", textAlign: "center" }}>
          <p style={{ color: "#65625a", fontSize: "13px", margin: 0 }}>All tasks look on track — no nudges needed.</p>
        </div>
      ) : (
        <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ fontSize: "12px", color: "#65625a", margin: "0 0 4px" }}>
            Auto-generated follow-up messages for at-risk tasks. Copy and send via Teams or email.
          </p>
          {atRiskItems.map(item => {
            const nudge = generateNudge(item, analysis.title);
            const isExpanded = expandedId === item.id;
            const riskColor = item.risk === "high" ? "#e05252" : item.blockers.length > 0 ? "#d4853a" : "#4b80e8";
            const riskBg = item.risk === "high" ? "#2a1010" : item.blockers.length > 0 ? "#2a2010" : "#141d3a";

            return (
              <div key={item.id} style={{ background: "#0d0d14", border: "1px solid #232330", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                  <MessageSquarePlus size={14} color="#c9a84c" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-display" style={{ fontWeight: 700, fontSize: "12px", color: "#f2f0eb", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.owner === "Unassigned" ? "⚠ Unassigned" : `→ ${item.owner}`}: {item.task}
                    </p>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {item.risk === "high" && <span style={{ fontSize: "10px", fontWeight: 600, color: riskColor, background: riskBg, padding: "1px 6px", borderRadius: "3px" }}>HIGH RISK</span>}
                      {item.blockers.length > 0 && <span style={{ fontSize: "10px", fontWeight: 600, color: "#d4853a", background: "#2a2010", padding: "1px 6px", borderRadius: "3px" }}>BLOCKED</span>}
                      {item.dueDate === "Needs date" && <span style={{ fontSize: "10px", fontWeight: 600, color: "#4b80e8", background: "#141d3a", padding: "1px 6px", borderRadius: "3px" }}>NO DATE</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", color: "#3a3a50" }}>{isExpanded ? "▲" : "▼"}</span>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid #1a1a24", padding: "10px 12px" }}>
                    <p style={{ fontSize: "13px", color: "#a8a499", lineHeight: 1.7, margin: "0 0 10px", whiteSpace: "pre-wrap" }}>
                      {nudge.replace(/\*\*/g, "")}
                    </p>
                    <button
                      type="button"
                      onClick={() => copy(nudge, item.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "6px 12px", borderRadius: "6px",
                        background: copiedId === item.id ? "rgba(76,175,125,0.1)" : "rgba(201,168,76,0.08)",
                        border: `1px solid ${copiedId === item.id ? "#4caf7d" : "#8a6d2e"}`,
                        color: copiedId === item.id ? "#4caf7d" : "#c9a84c",
                        fontSize: "12px", fontWeight: 600, cursor: "pointer"
                      }}
                    >
                      <Copy size={13} />
                      {copiedId === item.id ? "Copied!" : "Copy message"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
