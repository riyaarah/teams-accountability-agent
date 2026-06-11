"use client";

import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { MeetingAnalysis } from "@/types/meeting";

export function ScoreExplainer({ analysis }: { analysis: MeetingAnalysis }) {
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const score = analysis.accountabilityScore;
  const scoreColor = score >= 75 ? "#4caf7d" : score >= 50 ? "#d4853a" : "#e05252";

  async function explain() {
    if (explanation) { setOpen(o => !o); return; }
    setOpen(true);
    setLoading(true);

    const unassigned = analysis.actionItems.filter(i => i.owner === "Unassigned").length;
    const blocked = analysis.actionItems.filter(i => i.blockers.length > 0).length;
    const noDate = analysis.actionItems.filter(i => i.dueDate === "Needs date").length;
    const highRisk = analysis.actionItems.filter(i => i.risk === "high").length;

    const prompt = `You are an accountability analyst. Explain in 3-4 sentences why this meeting scored ${score}/100 for accountability.

Meeting: ${analysis.title}
Action items: ${analysis.actionItems.length}
Unassigned tasks: ${unassigned}
Blocked tasks: ${blocked}
Tasks with no due date: ${noDate}
High risk tasks: ${highRisk}
Decisions made: ${analysis.decisions.length}
Open questions: ${analysis.openQuestions.length}

Be specific, direct, and constructive. Mention what's good and what needs improvement. End with one actionable suggestion.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: "You are a concise accountability analyst. Give specific, actionable feedback.",
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      setExplanation(data.text ?? "Could not generate explanation.");
    } catch {
      setExplanation("Could not generate explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#111118", border: "1px solid #2e2e3f", borderRadius: "12px", overflow: "hidden" }}>
      <button
        type="button"
        onClick={explain}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "10px",
          padding: "1rem 1.25rem", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left", borderBottom: open ? "1px solid #2e2e3f" : "none"
        }}
      >
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Brain size={16} color="#c9a84c" />
        </div>
        <div style={{ flex: 1 }}>
          <p className="font-display" style={{ fontWeight: 700, fontSize: "14px", color: "#f2f0eb", margin: "0 0 2px" }}>
            Why did this meeting score <span style={{ color: scoreColor }}>{score}/100</span>?
          </p>
          <p style={{ fontSize: "12px", color: "#65625a", margin: 0 }}>
            {explanation ? "Click to toggle explanation" : "Click to get AI explanation"}
          </p>
        </div>
        {open ? <ChevronUp size={16} color="#65625a" /> : <ChevronDown size={16} color="#65625a" />}
      </button>

      {open && (
        <div style={{ padding: "1rem 1.25rem" }}>
          {loading ? (
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {[0,1,2].map(i => <div key={i} className="loading-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#c9a84c", animationDelay: `${i * 0.2}s` }} />)}
              <span style={{ fontSize: "13px", color: "#65625a", marginLeft: "6px" }}>Analyzing score…</span>
            </div>
          ) : (
            <p style={{ fontSize: "14px", color: "#a8a499", lineHeight: 1.75, margin: 0 }}>{explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}
