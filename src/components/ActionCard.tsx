import { AlertTriangle, CalendarClock, CheckCircle2, MessageSquare, Pencil, UserRound, XCircle } from "lucide-react";
import type { ActionItem } from "@/types/meeting";

export type ReviewStatus = "suggested" | "approved" | "needsEdit" | "dismissed";

const riskClasses = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-orange-50 text-orange-700 border-orange-200",
  high: "bg-red-50 text-red-700 border-red-200"
};

const statusLabels: Record<ReviewStatus, string> = {
  suggested: "Suggested",
  approved: "Approved",
  needsEdit: "Needs edit",
  dismissed: "Dismissed"
};

const statusClasses: Record<ReviewStatus, string> = {
  suggested: "bg-blue-50 text-cobalt border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  needsEdit: "bg-amber-50 text-amber-700 border-amber-200",
  dismissed: "bg-slate-100 text-slate-600 border-slate-200"
};

export function ActionCard({
  item,
  status,
  onStatusChange
}: {
  item: ActionItem;
  status: ReviewStatus;
  onStatusChange: (status: ReviewStatus) => void;
}) {
  return (
    <article className={status === "dismissed" ? "rounded-lg border border-night/10 bg-white p-5 opacity-70 shadow-sm" : "rounded-lg border border-night/10 bg-white p-5 shadow-sm"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase text-night/45">{item.id}</span>
          <h3 className="mt-1 text-lg font-black">{item.task}</h3>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${statusClasses[status]}`}>
            {statusLabels[status]}
          </span>
          <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${riskClasses[item.risk]}`}>
            {item.risk} risk
          </span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Meta icon={<UserRound size={15} />} label="Owner" value={item.owner} />
        <Meta icon={<CalendarClock size={15} />} label="Due" value={item.dueDate} />
        <Meta icon={<AlertTriangle size={15} />} label="Risk score" value={`${item.riskScore}/100`} />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-night/10">
        <div className="risk-gradient h-full rounded-full" style={{ width: `${item.riskScore}%` }} />
      </div>
      {item.blockers.length ? (
        <div className="mt-4 rounded-md bg-orange-50 p-3 text-sm text-orange-800">
          <span className="font-bold">Blockers:</span> {item.blockers.join("; ")}
        </div>
      ) : null}
      <div className="mt-4 rounded-md bg-paper p-3">
        <p className="text-xs font-black uppercase text-night/45">Evidence</p>
        <p className="mt-1 text-sm leading-6 text-night/70">{item.evidence}</p>
      </div>
      <div className="mt-4 flex gap-2 rounded-md border border-cobalt/15 bg-blue-50 p-3 text-sm text-cobalt">
        <MessageSquare size={16} className="mt-0.5 shrink-0" />
        <p>{item.followUpMessage}</p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <ReviewButton active={status === "approved"} icon={<CheckCircle2 size={16} />} label="Approve" onClick={() => onStatusChange("approved")} />
        <ReviewButton active={status === "needsEdit"} icon={<Pencil size={16} />} label="Edit first" onClick={() => onStatusChange("needsEdit")} />
        <ReviewButton active={status === "dismissed"} icon={<XCircle size={16} />} label="Dismiss" onClick={() => onStatusChange("dismissed")} />
      </div>
    </article>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md bg-paper p-3">
      <div className="flex items-center gap-2 text-night/50">
        {icon}
        <span className="text-xs font-black uppercase">{label}</span>
      </div>
      <p className="mt-2 font-bold">{value}</p>
    </div>
  );
}

function ReviewButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className={active ? "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-night px-3 py-2 text-sm font-black text-white" : "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-night/10 bg-white px-3 py-2 text-sm font-black text-night hover:bg-paper"}
      type="button"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
