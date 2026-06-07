import { NextResponse } from "next/server";
import type { MeetingInput, MeetingAnalysis } from "@/types/meeting";

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function safeJson<T>(text: string, fallback: T): T {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as T;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<MeetingInput>;
    const transcript = body.transcript?.trim();
    if (!transcript) {
      return NextResponse.json({ error: "Add a meeting transcript or notes before running the agent." }, { status: 400 });
    }

    const input: MeetingInput = {
      title: body.title?.trim() || "Untitled meeting",
      transcript,
      attendees: Array.isArray(body.attendees) ? body.attendees.filter(Boolean) : [],
      meetingDate: body.meetingDate || new Date().toISOString().slice(0, 10),
      urgency: body.urgency || "normal"
    };

    const context = `Meeting: "${input.title}" | Date: ${input.meetingDate} | Urgency: ${input.urgency} | Attendees: ${input.attendees.join(", ") || "unknown"}`;

    // AGENT 1: Extract action items
    const actionRaw = await callGroq(
      `You are a commitment extraction agent. Extract every action item, task, or commitment from meeting transcripts.
Return ONLY valid JSON array. No markdown, no explanation.
Each item: { "id": "ACT-01", "task": "string", "owner": "string or Unassigned", "dueDate": "string or Needs date", "confidence": 0-100, "riskScore": 0-100, "blockers": ["string"], "evidence": "exact quote from transcript", "suggestedPlannerBucket": "Committed|At risk|Needs clarification", "followUpMessage": "short Teams message to send" }
Risk score: 0=low, 100=high. Higher if: no owner, no date, has blockers, urgency is high/critical.`,
      `${context}\n\nTranscript:\n${input.transcript}`
    );

    const actionItems = safeJson<MeetingAnalysis["actionItems"]>(actionRaw, []).map((item, i) => ({
      ...item,
      id: `ACT-${String(i + 1).padStart(2, "0")}`,
      risk: item.riskScore >= 70 ? "high" : item.riskScore >= 45 ? "medium" : "low" as "low" | "medium" | "high"
    }));

    // AGENT 2: Extract decisions
    const decisionsRaw = await callGroq(
      `You are a decision capture agent. Extract explicit decisions made in meeting transcripts.
Return ONLY valid JSON array. No markdown, no explanation.
Each item: { "decision": "string", "owner": "string or null", "evidence": "exact quote" }`,
      `${context}\n\nTranscript:\n${input.transcript}`
    );
    const decisions = safeJson<MeetingAnalysis["decisions"]>(decisionsRaw, []);

    // AGENT 3: Extract open questions
    const questionsRaw = await callGroq(
      `You are an open question detector. Find unresolved questions, unclear ownership, or deferred decisions in meeting transcripts.
Return ONLY valid JSON array. No markdown, no explanation.
Each item: { "question": "string", "suggestedOwner": "string", "whyItMatters": "one sentence" }`,
      `${context}\n\nTranscript:\n${input.transcript}`
    );
    const openQuestions = safeJson<MeetingAnalysis["openQuestions"]>(questionsRaw, []);

    // AGENT 4: Risk scorer + summary
    const summaryRaw = await callGroq(
      `You are a risk and accountability scorer. Given meeting analysis data, produce an executive summary and accountability score.
Return ONLY valid JSON: { "executiveSummary": "2 sentences max", "accountabilityScore": 0-100, "followUpEmail": "full email text with subject line" }
Score 100 = every task has owner + deadline. Score 0 = nothing is owned or dated.`,
      `${context}
Action items: ${JSON.stringify(actionItems.map(a => ({ owner: a.owner, dueDate: a.dueDate, risk: a.risk })))}
Decisions: ${decisions.length}
Open questions: ${openQuestions.length}`
    );

    const scored = safeJson<{ executiveSummary: string; accountabilityScore: number; followUpEmail: string }>(
      summaryRaw,
      {
        executiveSummary: `${input.title} produced ${actionItems.length} action items and ${openQuestions.length} open questions.`,
        accountabilityScore: 50,
        followUpEmail: `Subject: Follow-up: ${input.title}\n\nHi team,\n\nPlease review your action items from today's meeting.`
      }
    );

    const plannerExport = actionItems
      .map(item => `${item.id} | ${item.suggestedPlannerBucket} | ${item.owner} | ${item.dueDate} | ${item.task} | Risk: ${item.risk.toUpperCase()}`)
      .join("\n");

    const agentTrace = [
      { agent: "Commitment Extraction Agent", status: actionItems.some(a => a.owner === "Unassigned") ? "warning" : "complete", summary: `Found ${actionItems.length} commitments. ${actionItems.filter(a => a.owner === "Unassigned").length} unassigned.` },
      { agent: "Decision Capture Agent", status: "complete", summary: `Captured ${decisions.length} explicit decisions.` },
      { agent: "Open Question Detector", status: openQuestions.length ? "warning" : "complete", summary: `Found ${openQuestions.length} unresolved questions.` },
      { agent: "Risk & Accountability Scorer", status: scored.accountabilityScore < 60 ? "warning" : "complete", summary: `Accountability score: ${scored.accountabilityScore}/100.` }
    ] as MeetingAnalysis["agentTrace"];

    const analysis: MeetingAnalysis = {
      title: input.title,
      executiveSummary: scored.executiveSummary,
      actionItems,
      decisions,
      openQuestions,
      followUpEmail: scored.followUpEmail,
      plannerExport,
      agentTrace,
      accountabilityScore: scored.accountabilityScore
    };

    return NextResponse.json(analysis);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "The accountability agent could not process this transcript." }, { status: 500 });
  }
}