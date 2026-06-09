"use client";

import { Bot, BrainCircuit, CheckCircle2, Clock, FileText, ShieldCheck, Workflow, Zap } from "lucide-react";
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
  const [hfToken, setHfToken] = useState("");

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
    <div style={{ minHeight: "100vh" }}>
      {/* Top nav bar */}
      <nav style={{
        borderBottom: "1px solid #2e2e3f",
        background: "rgba(9,9,12,0.85)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "56px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "7px",
            background: "linear-gradient(135deg,#c9a84c,#a07830)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Bot size={15} color="#09090c" />
          </div>
          <span className="font-display" style={{ fontWeight: 700, fontSize: "15px", color: "#f2f0eb", letterSpacing: "0.01em" }}>
            Accountability Agent
          </span>
          <span style={{
            marginLeft: "8px", padding: "2px 8px", borderRadius: "4px",
            background: "#1a1a24", border: "1px solid #2e2e3f",
            fontSize: "11px", fontWeight: 600, color: "#8a6d2e", letterSpacing: "0.06em", textTransform: "uppercase"
          }}>
            MS Teams
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <StatusDot label="AI Ready" />
          <StatusDot label="M365 Connected" />
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 2rem 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start" }}>
            {/* Left */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "6px 14px", borderRadius: "100px",
                border: "1px solid #8a6d2e",
                background: "rgba(201,168,76,0.06)",
                marginBottom: "1.5rem"
              }}>
                <Zap size={13} color="#c9a84c" />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#c9a84c", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Multi-agent pipeline
                </span>
              </div>

              <h1 className="font-display" style={{
                fontSize: "clamp(2.5rem,5vw,4.5rem)",
                fontWeight: 800,
                lineHeight: 0.95,
                color: "#f2f0eb",
                margin: "0 0 1.25rem",
                letterSpacing: "-0.02em"
              }}>
                Turn meetings<br />
                <span style={{
                  background: "linear-gradient(135deg,#c9a84c,#f0d080)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>into ownership.</span>
              </h1>

              <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "#a8a499", margin: "0 0 2rem", maxWidth: "480px" }}>
                Paste a Teams transcript and the agent extracts commitments, scores risk, flags vague tasks, and produces Planner-ready task rows — with full human review before anything ships.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "2.5rem" }}>
                <Pill icon={<BrainCircuit size={13} />} label="Agent trace" gold />
                <Pill icon={<ShieldCheck size={13} />} label="Risk scoring" />
                <Pill icon={<FileText size={13} />} label="Planner export" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <FeatureCard icon={<Workflow size={16} />} title="Multi-stage flow" copy="Intake, extract, risk, and follow-up." />
                <FeatureCard icon={<CheckCircle2 size={16} />} title="Accountability-first" copy="Flags missing owners, dates, blockers." />
                <FeatureCard icon={<Clock size={16} />} title="Fast demo" copy="One sample shows the full pipeline." />
              </div>
            </div>

            {/* Right — form */}
            <div>
              <TranscriptForm input={input} loading={loading} onChange={setInput} onAnalyze={analyze} onSample={loadSample} hfToken={hfToken} onHfTokenChange={setHfToken} />
            </div>
          </div>
        </section>

        {/* Results */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem 4rem" }}>
          {loading && <LoadingState />}
          {error && (
            <div style={{
              background: "#3d1a1a", border: "1px solid #7a2020",
              borderRadius: "12px", padding: "1rem 1.25rem",
              color: "#e05252", fontWeight: 600
            }}>
              {error}
            </div>
          )}
          {analysis && !loading && <Results analysis={analysis} hfToken={hfToken} />}
        </section>
      </main>
    </div>
  );
}

function StatusDot({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "4px 10px", borderRadius: "100px",
      background: "#111118", border: "1px solid #2e2e3f"
    }}>
      <div style={{
        width: "6px", height: "6px", borderRadius: "50%",
        background: "#4caf7d",
        boxShadow: "0 0 6px #4caf7d"
      }} />
      <span style={{ fontSize: "11px", fontWeight: 500, color: "#a8a499" }}>{label}</span>
    </div>
  );
}

function Pill({ icon, label, gold }: { icon: React.ReactNode; label: string; gold?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "6px 14px", borderRadius: "100px",
      border: `1px solid ${gold ? "#8a6d2e" : "#2e2e3f"}`,
      background: gold ? "rgba(201,168,76,0.08)" : "#1a1a24",
      fontSize: "12px", fontWeight: 600,
      color: gold ? "#c9a84c" : "#a8a499",
      letterSpacing: "0.04em"
    }}>
      {icon}
      {label}
    </span>
  );
}

function FeatureCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div style={{
      background: "#111118", border: "1px solid #2e2e3f",
      borderRadius: "10px", padding: "1rem"
    }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "8px",
        background: "rgba(201,168,76,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#c9a84c", marginBottom: "10px"
      }}>
        {icon}
      </div>
      <p className="font-display" style={{ fontWeight: 700, fontSize: "13px", color: "#f2f0eb", margin: "0 0 4px" }}>{title}</p>
      <p style={{ fontSize: "12px", color: "#65625a", margin: 0, lineHeight: 1.5 }}>{copy}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{
      background: "#111118", border: "1px solid #2e2e3f",
      borderRadius: "12px", padding: "2rem",
      display: "flex", alignItems: "center", gap: "1.5rem"
    }}>
      <div style={{ display: "flex", gap: "6px" }}>
        {[0,1,2].map(i => (
          <div key={i} className="loading-dot" style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: "#c9a84c",
            animationDelay: `${i * 0.2}s`
          }} />
        ))}
      </div>
      <div>
        <p className="font-display" style={{ fontWeight: 700, color: "#f2f0eb", margin: "0 0 4px" }}>Running agent pipeline</p>
        <p style={{ fontSize: "13px", color: "#65625a", margin: 0 }}>Extracting commitments, assigning risk, drafting follow-up artifacts…</p>
      </div>
    </div>
  );
}
