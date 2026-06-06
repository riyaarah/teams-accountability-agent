"use client";

import { ClipboardPaste, Play, Sparkles } from "lucide-react";
import type { MeetingInput } from "@/types/meeting";

type Props = {
  input: MeetingInput;
  loading: boolean;
  onChange: (input: MeetingInput) => void;
  onAnalyze: () => void;
  onSample: () => void;
};

export function TranscriptForm({ input, loading, onChange, onAnalyze, onSample }: Props) {
  return (
    <section className="glass rounded-lg border border-white/80 p-5 shadow-crisp">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-night px-4 py-3 text-white">
        <div>
          <p className="text-sm font-black">Meeting intake</p>
          <p className="text-xs text-white/65">Paste Teams transcript, notes, or rough call summary</p>
        </div>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-black text-night hover:bg-blue-50"
          type="button"
          onClick={onSample}
        >
          <Sparkles size={15} />
          Load sample
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="text-sm font-bold text-night/70">Meeting title</span>
          <input
            className="mt-2 h-12 w-full rounded-md border border-night/10 bg-white px-3 outline-none focus:border-cobalt"
            value={input.title}
            onChange={(event) => onChange({ ...input, title: event.target.value })}
          />
        </label>
        <label>
          <span className="text-sm font-bold text-night/70">Urgency</span>
          <select
            className="mt-2 h-12 w-full rounded-md border border-night/10 bg-white px-3 outline-none focus:border-cobalt"
            value={input.urgency}
            onChange={(event) => onChange({ ...input, urgency: event.target.value as MeetingInput["urgency"] })}
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-bold text-night/70">Attendees</span>
        <input
          className="mt-2 h-12 w-full rounded-md border border-night/10 bg-white px-3 outline-none focus:border-cobalt"
          value={input.attendees.join(", ")}
          onChange={(event) => onChange({ ...input, attendees: event.target.value.split(",").map((name) => name.trim()).filter(Boolean) })}
        />
      </label>
      <label className="mt-4 block">
        <span className="flex items-center gap-2 text-sm font-bold text-night/70">
          <ClipboardPaste size={16} />
          Transcript or meeting notes
        </span>
        <textarea
          className="mt-2 min-h-[330px] w-full resize-y rounded-md border border-night/10 bg-white p-4 leading-7 outline-none focus:border-cobalt"
          value={input.transcript}
          onChange={(event) => onChange({ ...input, transcript: event.target.value })}
        />
      </label>
      <button
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-cobalt px-5 py-3 font-black text-white shadow-crisp transition hover:-translate-y-0.5 hover:bg-violet disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={onAnalyze}
        disabled={loading}
      >
        <Play size={18} />
        {loading ? "Running accountability agents..." : "Run accountability agent"}
      </button>
    </section>
  );
}
