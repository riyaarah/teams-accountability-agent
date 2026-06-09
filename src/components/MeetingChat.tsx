"use client";

import { Bot, CornerDownLeft, Loader2, Sparkles, User } from "lucide-react";
import { useRef, useState } from "react";
import type { MeetingAnalysis } from "@/types/meeting";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "Who has the most blocked tasks?",
  "What's the highest risk action item?",
  "Which tasks are missing due dates?",
  "Draft a follow-up message for the team",
  "What decisions were made?",
  "Who is overloaded with tasks?",
];

const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

function buildPrompt(analysis: MeetingAnalysis, messages: Message[], userQuery: string): string {
  const items = analysis.actionItems
    .map(i => `- [${i.id}] ${i.task} | Owner: ${i.owner} | Due: ${i.dueDate} | Risk: ${i.risk} (${i.riskScore}/100) | Blockers: ${i.blockers.join(", ") || "none"}`)
    .join("\n");
  const decisions = analysis.decisions.map(d => `- ${d.decision}`).join("\n") || "None";
  const questions = analysis.openQuestions.map(q => `- ${q.question} (suggested owner: ${q.suggestedOwner})`).join("\n") || "None";

  const context = `You are an accountability agent assistant. Answer questions about this meeting concisely (2-4 sentences). Reference task IDs and owners when relevant. If drafting a message, write a professional Teams/email message.

MEETING: ${analysis.title}
SCORE: ${analysis.accountabilityScore}/100
SUMMARY: ${analysis.executiveSummary}

ACTION ITEMS:
${items}

DECISIONS:
${decisions}

OPEN QUESTIONS:
${questions}`;

  const history = messages
    .map(m => m.role === "user" ? `[INST] ${m.content} [/INST]` : `${m.content}`)
    .join("\n");

  return `<s>[INST] ${context}

Previous conversation:
${history}

${userQuery} [/INST]`;
}

export function MeetingChat({ analysis, hfToken }: { analysis: MeetingAnalysis; hfToken: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `I've analyzed "${analysis.title}". Found ${analysis.actionItems.length} action items with an accountability score of ${analysis.accountabilityScore}/100. Ask me anything about the meeting.`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(text?: string) {
    const query = text ?? input.trim();
    if (!query || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: query };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const prompt = buildPrompt(analysis, messages, query);
      const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.4,
            return_full_text: false,
            stop: ["[INST]", "</s>"]
          }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "HuggingFace API error");
      }

      const data = await response.json();
      const reply = Array.isArray(data)
        ? data[0]?.generated_text?.trim()
        : data?.generated_text?.trim();

      setMessages(prev => [...prev, {
        role: "assistant",
        content: reply || "I couldn't generate a response. Please try again."
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: err instanceof Error ? `Error: ${err.message}` : "Connection error. Check your HuggingFace token."
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div style={{
      background: "#111118", border: "1px solid #2e2e3f",
      borderRadius: "16px", overflow: "hidden",
      display: "flex", flexDirection: "column", height: "600px"
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "1rem 1.25rem", borderBottom: "1px solid #2e2e3f", background: "#0d0d14"
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px",
          background: "linear-gradient(135deg,#c9a84c,#a07830)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Bot size={16} color="#09090c" />
        </div>
        <div>
          <p className="font-display" style={{ fontWeight: 700, fontSize: "14px", color: "#f2f0eb", margin: 0 }}>Ask your meeting</p>
          <p style={{ fontSize: "11px", color: "#65625a", margin: 0 }}>Powered by Mistral 7B via HuggingFace</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4caf7d", boxShadow: "0 0 6px #4caf7d" }} />
          <span style={{ fontSize: "11px", color: "#65625a" }}>Free inference</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", gap: "10px",
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            alignItems: "flex-start"
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0,
              background: msg.role === "user" ? "#2e2e3f" : "linear-gradient(135deg,#c9a84c,#a07830)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {msg.role === "user" ? <User size={14} color="#a8a499" /> : <Bot size={14} color="#09090c" />}
            </div>
            <div style={{
              maxWidth: "75%",
              background: msg.role === "user" ? "#1a1a24" : "#0d0d14",
              border: `1px solid ${msg.role === "user" ? "#2e2e3f" : "#232330"}`,
              borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
              padding: "10px 14px", fontSize: "13px", color: "#f2f0eb",
              lineHeight: 1.7, whiteSpace: "pre-wrap"
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: "linear-gradient(135deg,#c9a84c,#a07830)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <Bot size={14} color="#09090c" />
            </div>
            <div style={{
              background: "#0d0d14", border: "1px solid #232330",
              borderRadius: "4px 12px 12px 12px",
              padding: "12px 16px", display: "flex", gap: "5px", alignItems: "center"
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="loading-dot" style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#c9a84c", animationDelay: `${i * 0.2}s`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div style={{ padding: "0 1.25rem 0.75rem", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {SUGGESTED.map(q => (
            <button key={q} type="button" onClick={() => send(q)} style={{
              padding: "5px 11px", borderRadius: "100px",
              background: "rgba(201,168,76,0.06)", border: "1px solid #3a3a20",
              color: "#a8a499", fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#8a6d2e"; e.currentTarget.style.color = "#c9a84c"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#3a3a20"; e.currentTarget.style.color = "#a8a499"; }}
            >
              <Sparkles size={11} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "0.75rem 1.25rem 1rem", borderTop: "1px solid #2e2e3f", display: "flex", gap: "8px" }}>
        <input
          className="field"
          style={{ flex: 1, height: "42px", padding: "0 14px", fontSize: "14px" }}
          placeholder="Ask about action items, owners, risk…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          disabled={loading}
        />
        <button
          className="btn-gold" type="button" onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{ width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
        >
          {loading ? <Loader2 size={16} /> : <CornerDownLeft size={16} />}
        </button>
      </div>
    </div>
  );
}
