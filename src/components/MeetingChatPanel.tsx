import { ClipboardList, ShieldCheck, Sparkles } from "lucide-react";
import type { MeetingAnalysis } from "@/types/meeting";

export function MeetingChatPanel({ analysis }: { analysis: MeetingAnalysis }) {
  return (
    <div style={{
      background: "#111118",
      border: "1px solid #2e2e3f",
      borderRadius: "16px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      minHeight: "300px"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "1rem 1.25rem",
        borderBottom: "1px solid #2e2e3f",
        background: "#0d0d14"
      }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: "linear-gradient(135deg,#c9a84c,#a07830)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <ShieldCheck size={16} color="#09090c" />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "14px", color: "#f2f0eb", margin: 0 }}>Action review snapshot</p>
          <p style={{ fontSize: "11px", color: "#65625a", margin: 0 }}>Quick summary of meeting outcomes and follow-up status</p>
        </div>
      </div>

      <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <MetricCard icon={<ClipboardList size={16} />} label="Action items" value={analysis.actionItems.length} />
          <MetricCard icon={<Sparkles size={16} />} label="Decisions" value={analysis.decisions.length} />
        </div>

        <div style={{ background: "#0d0d14", border: "1px solid #232330", borderRadius: "12px", padding: "1rem" }}>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#f2f0eb" }}>Next steps</p>
          <p style={{ margin: "0.75rem 0 0", fontSize: "13px", color: "#a8a499", lineHeight: 1.7 }}>
            {analysis.followUpEmail.slice(0, 160)}{analysis.followUpEmail.length > 160 ? "..." : ""}
          </p>
        </div>

        <div style={{ background: "#0d0d14", border: "1px solid #232330", borderRadius: "12px", padding: "1rem" }}>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#f2f0eb" }}>Top open question</p>
          <p style={{ margin: "0.75rem 0 0", fontSize: "13px", color: "#a8a499", lineHeight: 1.7 }}>
            {analysis.openQuestions[0]?.question ?? "No unresolved questions detected."}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={{ background: "#0d0d14", border: "1px solid #232330", borderRadius: "12px", padding: "1rem", display: "flex", gap: "12px", alignItems: "center" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(201,168,76,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c" }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "12px", color: "#65625a" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#f2f0eb" }}>{value}</p>
      </div>
    </div>
  );
}
