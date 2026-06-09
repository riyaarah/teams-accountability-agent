"use client";

import { ClipboardPaste, Play, Sparkles, UsersRound } from "lucide-react";
import type { MeetingInput } from "@/types/meeting";
import { TranscriptUpload } from "@/components/TranscriptUpload";

type Props = {
  input: MeetingInput;
  loading: boolean;
  hfToken: string;
  onChange: (input: MeetingInput) => void;
  onAnalyze: () => void;
  onSample: () => void;
  onHfTokenChange: (token: string) => void;
};

const urgencyColors = {
  normal: { bg: "#1a2a1a", border: "#2d4a2d", text: "#4caf7d" },
  high: { bg: "#2a2010", border: "#4a3510", text: "#d4853a" },
  critical: { bg: "#2a1010", border: "#4a2020", text: "#e05252" },
};

export function TranscriptForm({ input, loading, hfToken, onChange, onAnalyze, onSample, onHfTokenChange }: Props) {
  const urgency = urgencyColors[input.urgency];

  return (
    <div style={{
      background: "#111118",
      border: "1px solid #2e2e3f",
      borderRadius: "16px",
      overflow: "hidden"
    }}>
      {/* Header bar */}
      <div style={{
        background: "#0d0d14",
        borderBottom: "1px solid #2e2e3f",
        padding: "1rem 1.25rem",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <p className="font-display" style={{ fontWeight: 700, fontSize: "14px", color: "#f2f0eb", margin: "0 0 2px" }}>
            Meeting intake
          </p>
          <p style={{ fontSize: "12px", color: "#65625a", margin: 0 }}>
            Paste a Teams transcript, Copilot recap, or meeting notes
          </p>
        </div>
        <button
          className="btn-ghost"
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", fontSize: "13px", fontWeight: 600 }}
          type="button"
          onClick={onSample}
        >
          <Sparkles size={14} />
          Load sample
        </button>
      </div>

      <div style={{ padding: "1.25rem" }}>
        {/* Title + Urgency + Language */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#65625a", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>Meeting title</label>
            <input className="field" style={{ height: "40px", padding: "0 12px", fontSize: "14px" }} value={input.title} onChange={(e) => onChange({ ...input, title: e.target.value })} placeholder="Q3 planning sync…" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#65625a", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>Urgency</label>
            <select className="field" style={{ height: "40px", padding: "0 12px", fontSize: "14px", background: urgency.bg, borderColor: urgency.border, color: urgency.text }} value={input.urgency} onChange={(e) => onChange({ ...input, urgency: e.target.value as MeetingInput["urgency"] })}>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#65625a", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>Language</label>
            <select className="field" style={{ height: "40px", padding: "0 12px", fontSize: "14px" }} value={input.language ?? "en"} onChange={(e) => onChange({ ...input, language: e.target.value })}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
              <option value="ar">Arabic</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>
        </div>

        {/* Attendees */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#65625a", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
            Attendees
          </label>
          <input
            className="field"
            style={{ height: "40px", padding: "0 12px 0 38px", fontSize: "14px", position: "relative" }}
            value={input.attendees.join(", ")}
            onChange={(e) => onChange({ ...input, attendees: e.target.value.split(",").map(n => n.trim()).filter(Boolean) })}
            placeholder="Sarah, James, Priya…"
          />
        </div>

        {/* Import chips */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {["Teams transcript", "Copilot recap", "Outlook notes"].map(label => (
            <button
              key={label}
              className="btn-ghost"
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "7px 8px", fontSize: "12px", fontWeight: 600 }}
              type="button"
            >
              <UsersRound size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Upload */}
        <TranscriptUpload onTranscript={text => onChange({ ...input, transcript: text })} />

        {/* Transcript */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600, color: "#65625a", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
            <ClipboardPaste size={13} />
            Transcript or meeting notes
          </label>
          <textarea
            className="field"
            style={{ minHeight: "280px", padding: "12px", fontSize: "13px", lineHeight: 1.7, resize: "vertical", fontFamily: "'DM Mono', monospace" }}
            value={input.transcript}
            onChange={(e) => onChange({ ...input, transcript: e.target.value })}
            placeholder="Paste your transcript here…"
          />
        </div>

        {/* HuggingFace token */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#65625a", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
            HuggingFace token <span style={{ color: "#3a3a50", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(for chat feature)</span>
          </label>
          <input
            className="field"
            style={{ height: "40px", padding: "0 12px", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}
            type="password"
            placeholder="hf_xxxxxxxxxxxxxxxx"
            value={hfToken}
            onChange={e => onHfTokenChange(e.target.value)}
          />
          <p style={{ fontSize: "11px", color: "#3a3a50", margin: "5px 0 0" }}>
            Free at huggingface.co/settings/tokens — needed only for the chat panel
          </p>
        </div>

        {/* CTA */}
        <button
          className="btn-gold"
          style={{ width: "100%", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px" }}
          type="button"
          onClick={onAnalyze}
          disabled={loading}
        >
          <Play size={16} />
          {loading ? "Running accountability agents…" : "Run accountability agent"}
        </button>
      </div>
    </div>
  );
}
