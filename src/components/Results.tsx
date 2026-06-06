import { ClipboardList, Copy, HelpCircle, Mail, ShieldAlert } from "lucide-react";
import { ActionCard } from "@/components/ActionCard";
import { TracePanel } from "@/components/TracePanel";
import type { MeetingAnalysis } from "@/types/meeting";

export function Results({ analysis }: { analysis: MeetingAnalysis }) {
  const highRisk = analysis.actionItems.filter((item) => item.risk === "high").length;
  const unassigned = analysis.actionItems.filter((item) => item.owner === "Unassigned").length;

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
            <Metric label="Decisions" value={analysis.decisions.length} />
            <Metric label="Open questions" value={analysis.openQuestions.length} />
            <Metric label="Planner rows" value={analysis.actionItems.length} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="text-cobalt" />
          <h2 className="text-2xl font-black">Action items with risk</h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {analysis.actionItems.map((item) => (
            <ActionCard key={item.id} item={item} />
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
        <TextArtifact icon={<Copy size={20} />} title="Planner-ready export" text={analysis.plannerExport} />
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
