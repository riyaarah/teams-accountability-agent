import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { AgentTraceStep } from "@/types/meeting";

export function TracePanel({ steps }: { steps: AgentTraceStep[] }) {
  return (
    <section className="rounded-lg border border-night/10 bg-white p-5 shadow-crisp">
      <p className="text-sm font-black uppercase text-cobalt">Agent trace</p>
      <h2 className="mt-1 text-2xl font-black">How the agent reasoned</h2>
      <div className="mt-5 space-y-3">
        {steps.map((step) => (
          <div key={step.agent} className="flex gap-3 rounded-md border border-night/10 bg-paper p-4">
            <span className={step.status === "warning" ? "text-warning" : "text-cobalt"}>
              {step.status === "warning" ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            </span>
            <div>
              <p className="font-bold">{step.agent}</p>
              <p className="mt-1 text-sm leading-6 text-night/65">{step.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
