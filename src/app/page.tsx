"use client";

import { Bot, BrainCircuit, CheckCircle2, Clock, FileText, ShieldCheck, Workflow } from "lucide-react";
import { useState } from "react";
import { Results } from "@/components/Results";
import { TranscriptForm } from "@/components/TranscriptForm";
import { defaultAttendees, sampleTranscript } from "@/lib/sample";
import type { MeetingAnalysis, MeetingInput } from "@/types/meeting";

const initialInput: MeetingInput = {
  title: "Product demo readiness sync",
  transcript: "",
  attendees: defaultAttendees,
  meetingDate: new Date().toISOString().slice(0, 10),
  urgency: "high"
};

export default function Home() {
  const [input, setInput] = useState<MeetingInput>(initialInput);
  const [analysis, setAnalysis] = useState<MeetingAnalysis>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  function loadSample() {
    setInput({ ...initialInput, transcript: sampleTranscript });
  }

  async function analyze() {
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not analyze this meeting.");
      setAnalysis(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not analyze this meeting.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="mx-auto grid min-h-[92vh] max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cobalt/15 bg-white/80 px-3 py-2 text-sm font-black text-cobalt shadow-sm">
            <Bot size={16} />
            Microsoft-style accountability agent
          </div>
          <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.96] text-night md:text-7xl">
            Turn meetings into ownership.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-night/70">
            Paste a Teams transcript and the agent extracts commitments, detects vague tasks, flags risk, drafts follow-ups, and produces Planner-ready task rows.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge icon={<BrainCircuit size={15} />} label="Agent trace" dark />
            <Badge icon={<ShieldCheck size={15} />} label="Risk scoring" />
            <Badge icon={<FileText size={15} />} label="Planner export" />
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <Signal icon={<Workflow size={18} />} title="Multi-agent flow" copy="Intake, extraction, risk, and follow-up stages." />
            <Signal icon={<CheckCircle2 size={18} />} title="Accountability-first" copy="Flags missing owners, dates, blockers, and vague tasks." />
            <Signal icon={<Clock size={18} />} title="Fast demo" copy="One sample transcript shows the full workflow." />
          </div>
        </div>
        <TranscriptForm input={input} loading={loading} onChange={setInput} onAnalyze={analyze} onSample={loadSample} />
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-5 pb-12 lg:px-8">
        {loading ? (
          <div className="rounded-lg border border-night/10 bg-white p-6 shadow-crisp">
            <p className="font-black">Running agent pipeline...</p>
            <p className="mt-1 text-night/60">Extracting commitments, assigning risk, and drafting follow-up artifacts.</p>
          </div>
        ) : null}
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 font-bold text-red-700">{error}</div> : null}
        {analysis && !loading ? <Results analysis={analysis} /> : null}
      </section>
    </main>
  );
}

function Badge({ icon, label, dark }: { icon: React.ReactNode; label: string; dark?: boolean }) {
  return (
    <span className={dark ? "inline-flex items-center gap-2 rounded-full bg-night px-4 py-2 text-sm font-black text-white" : "inline-flex items-center gap-2 rounded-full border border-cobalt/15 bg-white/75 px-4 py-2 text-sm font-black text-cobalt"}>
      {icon}
      {label}
    </span>
  );
}

function Signal({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="glass rounded-lg border border-white/75 p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-cobalt">{icon}</div>
      <p className="mt-3 font-black">{title}</p>
      <p className="mt-1 text-sm leading-6 text-night/60">{copy}</p>
    </div>
  );
}
