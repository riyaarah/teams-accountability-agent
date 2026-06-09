"use client";

import {
  BriefcaseBusiness, CheckCircle2, ClipboardCheck, ClipboardList,
  Copy, Filter, HelpCircle, Mail, Send, ShieldAlert, ShieldCheck, UserRoundCheck
} from "lucide-react";
import { useMemo, useState } from "react";
import { ActionCard, type ReviewStatus } from "@/components/ActionCard";
import { MeetingChat } from "@/components/MeetingChat";
import { RiskHeatmap } from "@/components/RiskHeatmap";
import { SmartNudges } from "@/components/SmartNudges";
import { TracePanel } from "@/components/TracePanel";
import type { MeetingAnalysis } from "@/types/meeting";

export function Results({ analysis, hfToken }: { analysis: MeetingAnalysis; hfToken: string }) {
  const [selectedOwner, setSelectedOwner] = useState("All employees");
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, ReviewStatus>>(() =>
    Object.fromEntries(analysis.actionItems.map(item => [item.id, "suggested" satisfies ReviewStatus]))
  );

  const highRisk = analysis.actionItems.filter(i => i.risk === "high").length;
  const unassigned = analysis.actionItems.filter(i => i.owner === "Unassigned").length;
  const owners = useMemo(() => ["All employees", ...Array.from(new Set(analysis.actionItems.map(i => i.owner)))], [analysis.actionItems]);
  const visibleItems = selectedOwner === "All employees" ? analysis.actionItems : analysis.actionItems.filter(i => i.owner === selectedOwner);
  const approvedItems = analysis.actionItems.filter(i => reviewStatuses[i.id] === "approved");
  const needsEdit = analysis.actionItems.filter(i => reviewStatuses[i.id] === "needsEdit").length;
  const dismissed = analysis.actionItems.filter(i => reviewStatuses[i.id] === "dismissed").length;
  const approvedPlannerExport = buildApprovedPlannerExport(approvedItems);
  const roleSummary = buildRoleSummary(selectedOwner, visibleItems);

  const scoreColor = analysis.accountabilityScore >= 75 ? "#4caf7d"
    : analysis.accountabilityScore >= 50 ? "#d4853a" : "#e05252";
  const scoreBg = analysis.accountabilityScore >= 75 ? "#112a1e"
    : analysis.accountabilityScore >= 50 ? "#2a2010" : "#2a1010";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="animate-fadeup">

      {/* Score hero */}
      <div style={{
        display: "grid", gridTemplateColumns: "auto 1fr",
        gap: "2rem", alignItems: "stretch",
        background: "#111118", border: "1px solid #2e2e3f",
        borderRadius: "16px", overflow: "hidden"
      }}>
        <div style={{
          background: scoreBg, borderRight: "1px solid #2e2e3f",
          padding: "2rem 2.5rem",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          minWidth: "200px"
        }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#65625a", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.5rem" }}>Accountability</p>
          <div className="font-display" style={{ fontSize: "6rem", fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{analysis.accountabilityScore}</div>
          <p style={{ fontSize: "12px", color: "#65625a", margin: "0.5rem 0 0", letterSpacing: "0.04em" }}>/100</p>
        </div>
        <div style={{ padding: "1.5rem 2rem" }}>
          <p style={{ fontSize: "14px", color: "#a8a499", lineHeight: 1.7, margin: "0 0 1.5rem", maxWidth: "600px" }}>{analysis.executiveSummary}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px" }}>
            <StatCard label="Action items" value={analysis.actionItems.length} />
            <StatCard label="High risk" value={highRisk} color="#e05252" />
            <StatCard label="Unassigned" value={unassigned} color="#d4853a" />
            <StatCard label="Approved" value={approvedItems.length} color="#4caf7d" />
            <StatCard label="Needs edit" value={needsEdit} />
            <StatCard label="Dismissed" value={dismissed} />
            <StatCard label="Decisions" value={analysis.decisions.length} />
            <StatCard label="Questions" value={analysis.openQuestions.length} />
            <StatCard label="Planner rows" value={analysis.actionItems.length} />
          </div>
        </div>
      </div>

      {/* Commitments + Trust */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <Panel icon={<UserRoundCheck size={18} color="#c9a84c" />} title="My commitments">
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#0d0d14", border: "1px solid #232330", borderRadius: "8px", padding: "0 12px" }}>
              <Filter size={14} color="#c9a84c" />
              <select style={{ flex: 1, height: "38px", background: "transparent", border: "none", color: "#f2f0eb", fontSize: "13px", fontWeight: 600, outline: "none", cursor: "pointer" }}
                value={selectedOwner} onChange={e => setSelectedOwner(e.target.value)}>
                {owners.map(o => <option key={o} value={o} style={{ background: "#111118" }}>{o}</option>)}
              </select>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "#a8a499", lineHeight: 1.6, background: "#0d0d14", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>{roleSummary}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            <StatCard label="Visible tasks" value={visibleItems.length} />
            <StatCard label="Blocked" value={visibleItems.filter(i => i.blockers.length > 0).length} color="#d4853a" />
            <StatCard label="Date missing" value={visibleItems.filter(i => i.dueDate === "Needs date").length} color="#e05252" />
          </div>
        </Panel>

        <Panel icon={<ShieldCheck size={18} color="#c9a84c" />} title="Trust controls">
          {[
            { t: "Human approval", d: "No task is treated as ready for Planner until an employee approves it." },
            { t: "Evidence attached", d: "Every suggestion keeps the transcript line that produced it for quick correction." },
            { t: "Microsoft 365 handoff", d: "Approved tasks can move to Planner, To Do, Outlook follow-up, or a Teams recap." },
            { t: "Sensitive meeting safety", d: "The review queue supports dismissing items before they leave the analysis screen." },
          ].map(row => (
            <div key={row.t} style={{ background: "#0d0d14", border: "1px solid #232330", borderRadius: "8px", padding: "10px 12px" }}>
              <p className="font-display" style={{ fontWeight: 700, fontSize: "13px", color: "#f2f0eb", margin: "0 0 3px" }}>{row.t}</p>
              <p style={{ fontSize: "12px", color: "#65625a", margin: 0, lineHeight: 1.5 }}>{row.d}</p>
            </div>
          ))}
        </Panel>
      </div>

      {/* M365 Actions */}
      <Panel icon={<BriefcaseBusiness size={18} color="#c9a84c" />} title="Microsoft 365 actions">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
          <M365Btn icon={<ClipboardCheck size={16} />} label="Create Planner tasks" detail={`${approvedItems.length} approved rows`} disabled={!approvedItems.length} />
          <M365Btn icon={<CheckCircle2 size={16} />} label="Assign in To Do" detail="Owner-filtered tasks" disabled={!approvedItems.length} />
          <M365Btn icon={<Mail size={16} />} label="Draft Outlook recap" detail="Actions and questions" disabled={false} />
          <M365Btn icon={<Send size={16} />} label="Post Teams summary" detail="Channel-ready recap" disabled={false} />
        </div>
      </Panel>

      {/* Review queue */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ClipboardList size={18} color="#c9a84c" />
            <h2 className="font-display" style={{ fontWeight: 800, fontSize: "1.25rem", color: "#f2f0eb", margin: 0 }}>Review queue</h2>
          </div>
          <span style={{ fontSize: "12px", color: "#65625a", fontWeight: 600 }}>{visibleItems.length} shown</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {visibleItems.map(item => (
            <ActionCard key={item.id} item={item}
              status={reviewStatuses[item.id] ?? "suggested"}
              onStatusChange={status => setReviewStatuses(cur => ({ ...cur, [item.id]: status }))}
            />
          ))}
        </div>
      </div>

      {/* Decisions + Questions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <Panel icon={<ShieldAlert size={18} color="#c9a84c" />} title="Decisions made">
          {analysis.decisions.length ? analysis.decisions.map(d => (
            <div key={d.evidence} style={{ background: "#0d0d14", border: "1px solid #232330", borderRadius: "8px", padding: "10px 12px" }}>
              <p className="font-display" style={{ fontWeight: 700, fontSize: "13px", color: "#f2f0eb", margin: "0 0 4px" }}>{d.decision}</p>
              <p className="font-mono" style={{ fontSize: "11px", color: "#65625a", margin: 0 }}>{d.evidence}</p>
            </div>
          )) : <p style={{ fontSize: "13px", color: "#65625a" }}>No explicit decisions detected.</p>}
        </Panel>

        <Panel icon={<HelpCircle size={18} color="#c9a84c" />} title="Open questions">
          {analysis.openQuestions.length ? analysis.openQuestions.map(q => (
            <div key={q.question} style={{ background: "#0d0d14", border: "1px solid #232330", borderRadius: "8px", padding: "10px 12px" }}>
              <p className="font-display" style={{ fontWeight: 700, fontSize: "13px", color: "#f2f0eb", margin: "0 0 4px" }}>{q.question}</p>
              <p style={{ fontSize: "12px", color: "#65625a", margin: 0 }}>Owner: {q.suggestedOwner} · {q.whyItMatters}</p>
            </div>
          )) : <p style={{ fontSize: "13px", color: "#65625a" }}>No open questions detected.</p>}
        </Panel>
      </div>

      {/* Artifacts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <CodeArtifact icon={<Copy size={16} />} title="Approved Planner export" text={approvedPlannerExport || "Approve tasks in the review queue to stage Planner rows."} />
        <CodeArtifact icon={<Mail size={16} />} title="Follow-up email" text={analysis.followUpEmail} />
      </div>

      {/* Heatmap + Nudges */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <RiskHeatmap analysis={analysis} />
        <SmartNudges analysis={analysis} />
      </div>

      {/* Chat */}
      <MeetingChat analysis={analysis} hfToken={hfToken} />

      <TracePanel steps={analysis.agentTrace} />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ background: "#0d0d14", border: "1px solid #1a1a24", borderRadius: "8px", padding: "10px 12px" }}>
      <p style={{ fontSize: "10px", fontWeight: 600, color: "#3a3a50", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 5px" }}>{label}</p>
      <p className="font-display" style={{ fontSize: "1.75rem", fontWeight: 800, color: color ?? "#f2f0eb", margin: 0 }}>{value}</p>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#111118", border: "1px solid #2e2e3f", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "1rem 1.25rem", borderBottom: "1px solid #1a1a24" }}>
        {icon}
        <h2 className="font-display" style={{ fontWeight: 700, fontSize: "15px", color: "#f2f0eb", margin: 0 }}>{title}</h2>
      </div>
      <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "8px" }}>{children}</div>
    </div>
  );
}

function M365Btn({ icon, label, detail, disabled }: { icon: React.ReactNode; label: string; detail: string; disabled: boolean }) {
  return (
    <button type="button" disabled={disabled}
      style={{ textAlign: "left", background: "#0d0d14", border: `1px solid ${disabled ? "#1a1a24" : "#2e2e3f"}`, borderRadius: "10px", padding: "14px", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, transition: "all 0.15s" }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget.style.borderColor = "#8a6d2e"); }}
      onMouseLeave={e => { if (!disabled) (e.currentTarget.style.borderColor = "#2e2e3f"); }}
    >
      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", marginBottom: "10px" }}>{icon}</div>
      <p className="font-display" style={{ fontWeight: 700, fontSize: "13px", color: "#f2f0eb", margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontSize: "11px", color: "#65625a", margin: 0 }}>{detail}</p>
    </button>
  );
}

function CodeArtifact({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div style={{ background: "#111118", border: "1px solid #2e2e3f", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "1rem 1.25rem", borderBottom: "1px solid #1a1a24" }}>
        <span style={{ color: "#c9a84c" }}>{icon}</span>
        <h2 className="font-display" style={{ fontWeight: 700, fontSize: "15px", color: "#f2f0eb", margin: 0 }}>{title}</h2>
      </div>
      <pre className="font-mono" style={{ maxHeight: "320px", overflowY: "auto", padding: "1rem 1.25rem", fontSize: "12px", lineHeight: 1.7, color: "#a8a499", margin: 0, whiteSpace: "pre-wrap" }}>{text}</pre>
    </div>
  );
}

function buildApprovedPlannerExport(items: MeetingAnalysis["actionItems"]) {
  return items.map(item => `${item.id} | ${item.suggestedPlannerBucket} | ${item.owner} | ${item.dueDate} | ${item.task} | Risk: ${item.risk.toUpperCase()} | APPROVED`).join("\n");
}

function buildRoleSummary(owner: string, items: MeetingAnalysis["actionItems"]) {
  const blocked = items.filter(i => i.blockers.length > 0).length;
  const highRisk = items.filter(i => i.risk === "high").length;
  if (owner === "All employees") return `${items.length} tasks across the meeting — ${blocked} blocked, ${highRisk} high-risk.`;
  return `${owner} has ${items.length} commitments, ${blocked} blockers to clear, ${highRisk} high-risk items.`;
}
