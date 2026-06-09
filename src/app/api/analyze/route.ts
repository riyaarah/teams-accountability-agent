import { NextResponse } from "next/server";

const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

type MeetingInput = {
  title: string;
  transcript: string;
  attendees: string[];
  meetingDate: string;
  urgency: "normal" | "high" | "critical";
};

type MeetingAnalysis = {
  title: string;
  executiveSummary: string;
  actionItems: Array<{
    id: string;
    task: string;
    owner: string;
    dueDate: string;
    confidence: number;
    risk: "low" | "medium" | "high";
    riskScore: number;
    blockers: string[];
    evidence: string;
    suggestedPlannerBucket: string;
    followUpMessage: string;
  }>;
  decisions: Array<{ decision: string; owner?: string | null; evidence: string }>;
  openQuestions: Array<{ question: string; suggestedOwner: string; whyItMatters: string }>;
  followUpEmail: string;
  plannerExport: string;
  agentTrace: Array<{ agent: string; status: "complete" | "warning"; summary: string }>;
  accountabilityScore: number;
};

function safeJson<T>(text: string, fallback: T): T {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as T;
  } catch (error) {
    console.error("safeJson parse error", error, text);
    return fallback;
  }
}

function buildPrompt(input: MeetingInput) {
  return `You are an accountability agent.
Analyze the meeting transcript below and return ONLY valid JSON that matches the following structure exactly:
{
  "title": string,
  "executiveSummary": string,
  "actionItems": [
    {
      "id": string,
      "task": string,
      "owner": string,
      "dueDate": string,
      "confidence": number,
      "risk": "low" | "medium" | "high",
      "riskScore": number,
      "blockers": [string],
      "evidence": string,
      "suggestedPlannerBucket": string,
      "followUpMessage": string
    }
  ],
  "decisions": [{ "decision": string, "owner": string | null, "evidence": string }],
  "openQuestions": [{ "question": string, "suggestedOwner": string, "whyItMatters": string }],
  "followUpEmail": string,
  "plannerExport": string,
  "agentTrace": [{ "agent": string, "status": "complete" | "warning", "summary": string }],
  "accountabilityScore": number
}

Meeting title: ${input.title}
Date: ${input.meetingDate}
Urgency: ${input.urgency}
Attendees: ${input.attendees.join(", ") || "unknown"}

Transcript:
${input.transcript}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch((err) => {
      console.error("Failed to parse request body", err);
      return null;
    });

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const input = (body.input ?? body) as MeetingInput;
    const hfToken = body.hfToken || body.hf_token;

    if (!input || typeof input.transcript !== "string") {
      return NextResponse.json({ error: "Transcript is required." }, { status: 400 });
    }

    if (!hfToken || typeof hfToken !== "string" || !hfToken.trim()) {
      return NextResponse.json({ error: "HuggingFace token is required." }, { status: 400 });
    }

    const prompt = buildPrompt(input);
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.2,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      console.error("HuggingFace response error", response.status, response.statusText, err);
      return NextResponse.json({ error: err?.error ?? `HuggingFace error ${response.status}` }, { status: 400 });
    }

    const data = await response.json();
    const text = Array.isArray(data) ? data[0]?.generated_text?.trim() : data?.generated_text?.trim();

    const fallback: MeetingAnalysis = {
      title: input.title,
      executiveSummary: "The model did not return a structured analysis.",
      actionItems: [],
      decisions: [],
      openQuestions: [],
      followUpEmail: "Review the transcript and define action items manually.",
      plannerExport: "",
      agentTrace: [{ agent: "Accountability analyzer", status: "warning", summary: "Unable to parse model response into structured JSON." }],
      accountabilityScore: 0
    };

    if (!text) {
      console.error("No text returned from HuggingFace response", data);
      return NextResponse.json(fallback);
    }

    const analysis = safeJson<MeetingAnalysis>(text, fallback);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Analyze route unexpected error", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
