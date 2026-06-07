"use client";

import { BriefcaseBusiness, CheckCircle2, ClipboardCheck, ClipboardList, Copy, Filter, HelpCircle, Mail, Send, ShieldAlert, ShieldCheck, UserRoundCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionCard, type ReviewStatus } from "@/components/ActionCard";
import { TracePanel } from "@/components/TracePanel";
import type { MeetingAnalysis } from "@/types/meeting";

export function Results({ analysis }: { analysis: MeetingAnalysis }) {
  const [selectedOwner, setSelectedOwner] = useState("All employees");
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, ReviewStatus>>(() =>
    Object.fromEntries(analysis.actionItems.map((item) => [item.id, "suggested" satisfies ReviewStatus]))
  );
  const highRisk = analysis.actionItems.filter((item) => item.risk === "high").length;
  const unassigned = analysis.actionItems.filter((item) => item.owner === "Unassigned").length;
  const owners = useMemo(() => ["All employees", ...Array.from(new Set(analysis.actionItems.map((item) => item.owner)))], [analysis.actionItems]);
  const visibleItems = selectedOwner === "All employees" ? analysis.actionItems : analysis.actionItems.filter((item) => item.owner === selectedOwner);
  const approvedItems = analysis.actionItems.filter((item) => reviewStatuses[item.id] === "approved");
  const needsEdit = analysis.actionItems.filter((item) => reviewStatuses[item.id] === "needsEdit").length;
  const dismissed = analysis.actionItems.filter((item) => reviewStatuses[item.id] === "dismissed").length;
  const approvedPlannerExport = buildApprovedPlannerExport(approvedItems);
  const roleSummary = buildRoleSummary(selectedOwner, visibleItems);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-night/10 bg-white shadow-crisp">
        <div className="grid lg:grid-cols-[0.75fr_1.25fr]">
          <div className="bg-night p-6 text-white">
            <p className="text-sm font-black uppercase text-white/55">Accountability score</p>
            <p className="mt-3 text-7xl font-black">{analysis.accountabilityScore}</p>
            <p className="mt-4 leading-7 text-white/70">{analysis.executiveSummary}</p>
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-3">
            <Metric label="Action items" value={analysis.actionItems.length} />
            <Metric label="High risk" value={highRisk} />
            <Metric label="Unassigned" value={unassigned} />
            <Metric label="Approved" value={approvedItems.length} />
            <Metric label="Needs edit" value={needsEdit} />
            <Metric label="Dismissed" value={dismissed} />
            <Metric label="Decisions" value={analysis.decisions.length} />
            <Metric label="Open questions" value={analysis.openQuestions.length} />
            <Metric label="Planner rows" value={analysis.actionItems.length} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel icon={<UserRoundCheck size={20} />} title="My commitments">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-64 flex-1 items-center gap-2 rounded-md border border-night/10 bg-white px-3 py-2">
              <Filter size={16} className="text-cobalt" />
              <select
                className="h-9 flex-1 bg-transparent font-bold outline-none"
                value={selectedOwner}
                onChange={(event) => setSelectedOwner(event.target.value)}
              >
                {owners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="rounded-md bg-paper p-3 text-sm font-bold leading-6 text-night/70">{roleSummary}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Visible tasks" value={visibleItems.length} />
            <Metric label="Blocked" value={visibleItems.filter((item) => item.blockers.length > 0).length} />
            <Metric label="Due missing" value={visibleItems.filter((item) => item.dueDate === "Needs date").length} />
          </div>
        </Panel>

        <Panel icon={<ShieldCheck size={20} />} title="Employee trust controls">
          <TrustRow title="Human approval" copy="No task is treated as ready for Planner until an employee approves it." />
          <TrustRow title="Evidence attached" copy="Every suggestion keeps the transcript line that produced it for quick correction." />
          <TrustRow title="Microsoft 365 handoff" copy="Approved tasks can move to Planner, To Do, Outlook follow-up, or a Teams recap." />
          <TrustRow title="Sensitive meeting safety" copy="The review queue supports dismissing items before they leave the analysis screen." />
        </Panel>
      </section>

      <section className="rounded-lg border border-night/10 bg-white p-5 shadow-crisp">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-cobalt">
            <BriefcaseBusiness size={20} />
            <h2 className="text-xl font-black text-night">Microsoft 365 actions</h2>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-700">
            {approvedItems.length} approved
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <M365Action icon={<ClipboardCheck size={18} />} label="Create Planner tasks" detail={`${approvedItems.length} approved rows`} disabled={!approvedItems.length} />
          <M365Action icon={<CheckCircle2 size={18} />} label="Assign in To Do" detail="Owner-filtered tasks" disabled={!approvedItems.length} />
          <M365Action icon={<Mail size={18} />} label="Draft Outlook recap" detail="Actions and questions" disabled={false} />
          <M365Action icon={<Send size={18} />} label="Post Teams summary" detail="Channel-ready recap" disabled={false} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-cobalt" />
            <h2 className="text-2xl font-black">Review queue</h2>
          </div>
          <span className="text-sm font-bold text-night/55">{visibleItems.length} shown</span>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleItems.map((item) => (
            <ActionCard
              key={item.id}
              item={item}
              status={reviewStatuses[item.id] ?? "suggested"}
              onStatusChange={(status) => setReviewStatuses((current) => ({ ...current, [item.id]: status }))}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel icon={<ShieldAlert size={20} />} title="Decisions made">
          {analysis.decisions.length ? (
            analysis.decisions.map((decision) => (
              <div key={decision.evidence} className="rounded-md bg-paper p-3">
                <p className="font-bold">{decision.decision}</p>
                <p className="mt-1 text-sm text-night/55">{decision.evidence}</p>
              </div>
            ))
          ) : (
            <p className="text-night/60">No explicit decisions detected.</p>
          )}
        </Panel>
        <Panel icon={<HelpCircle size={20} />} title="Open questions">
          {analysis.openQuestions.length ? (
            analysis.openQuestions.map((question) => (
              <div key={question.question} className="rounded-md bg-paper p-3">
                <p className="font-bold">{question.question}</p>
                <p className="mt-1 text-sm text-night/60">Owner: {question.suggestedOwner} · {question.whyItMatters}</p>
              </div>
            ))
          ) : (
            <p className="text-night/60">No open questions detected.</p>
          )}
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <TextArtifact icon={<Copy size={20} />} title="Approved Planner export" text={approvedPlannerExport || "Approve tasks in the review queue to stage Planner rows."} />
        <TextArtifact icon={<Mail size={20} />} title="Follow-up email" text={analysis.followUpEmail} />
      </section>

      <TracePanel steps={analysis.agentTrace} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-night/10 bg-paper p-4">
      <p className="text-xs font-black uppercase text-night/45">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function TrustRow({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-md bg-paper p-3">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm leading-6 text-night/60">{copy}</p>
    </div>
  );
}

function M365Action({ icon, label, detail, disabled }: { icon: React.ReactNode; label: string; detail: string; disabled: boolean }) {
  return (
    <button
      className="min-h-24 rounded-md border border-night/10 bg-paper p-4 text-left transition hover:-translate-y-0.5 hover:border-cobalt/40 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:border-night/10 disabled:hover:bg-paper"
      type="button"
      disabled={disabled}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-cobalt shadow-sm">{icon}</span>
      <span className="mt-3 block font-black">{label}</span>
      <span className="mt-1 block text-sm font-bold text-night/50">{detail}</span>
    </button>
  );
}

function buildApprovedPlannerExport(items: MeetingAnalysis["actionItems"]) {
  return items
    .map((item) => `${item.id} | ${item.suggestedPlannerBucket} | ${item.owner} | ${item.dueDate} | ${item.task} | Risk: ${item.risk.toUpperCase()} | Status: APPROVED`)
    .join("\n");
}

function buildRoleSummary(owner: string, items: MeetingAnalysis["actionItems"]) {
  const blocked = items.filter((item) => item.blockers.length > 0).length;
  const highRisk = items.filter((item) => item.risk === "high").length;
  if (owner === "All employees") {
    return `${items.length} tasks across the meeting, including ${blocked} blocked items and ${highRisk} high-risk commitments.`;
  }
  return `${owner} has ${items.length} visible commitments, ${blocked} blockers to clear, and ${highRisk} high-risk items to watch.`;
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-night/10 bg-white p-5 shadow-crisp">
      <div className="mb-4 flex items-center gap-2 text-cobalt">
        {icon}
        <h2 className="text-xl font-black text-night">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function TextArtifact({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <section className="rounded-lg border border-night/10 bg-white p-5 shadow-crisp">
      <div className="mb-4 flex items-center gap-2 text-cobalt">
        {icon}
        <h2 className="text-xl font-black text-night">{title}</h2>
      </div>
      <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-md bg-night p-4 text-sm leading-6 text-white">{text}</pre>
    </section>
  );
}
