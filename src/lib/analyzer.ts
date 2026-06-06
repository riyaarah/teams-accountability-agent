import type { ActionItem, ActionRisk, AgentTraceStep, Decision, MeetingAnalysis, MeetingInput, OpenQuestion } from "@/types/meeting";

const taskPatterns = [
  /\b(?:i will|i'll|i can|i need to|i’m going to|i am going to|can you|please|someone should|we need to|need to)\b/i,
  /\b(?:own|prepare|send|connect|finish|polish|record|create|draft|review|submit|update|share|build)\b/i
];

export function analyzeMeeting(input: MeetingInput): MeetingAnalysis {
  const lines = normalizeLines(input.transcript);
  const actionItems = extractActionItems(lines, input);
  const decisions = extractDecisions(lines);
  const openQuestions = extractQuestions(lines, input.attendees);
  const executiveSummary = buildSummary(input, actionItems, decisions, openQuestions);
  const plannerExport = buildPlannerExport(actionItems);
  const followUpEmail = buildFollowUpEmail(input, executiveSummary, actionItems, decisions, openQuestions);
  const accountabilityScore = scoreAccountability(actionItems, openQuestions);
  const agentTrace = buildTrace(input, actionItems, decisions, openQuestions, accountabilityScore);

  return {
    title: input.title || "Untitled meeting",
    executiveSummary,
    actionItems,
    decisions,
    openQuestions,
    followUpEmail,
    plannerExport,
    agentTrace,
    accountabilityScore
  };
}

function normalizeLines(transcript: string) {
  return transcript
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractActionItems(lines: string[], input: MeetingInput): ActionItem[] {
  const items = lines
    .filter((line) => taskPatterns.every((pattern) => pattern.test(line)) || /blocker|by\s+\w+|before\s+\w+|due/i.test(line))
    .map((line, index) => {
      const speaker = line.includes(":") ? line.split(":")[0].trim() : "";
      const owner = inferOwner(line, speaker, input.attendees);
      const dueDate = inferDueDate(line, input.meetingDate);
      const blockers = inferBlockers(line);
      const confidence = inferConfidence(line, owner, dueDate);
      const riskScore = inferRiskScore(line, owner, dueDate, blockers, input.urgency);
      const risk = labelRisk(riskScore);
      const task = cleanTask(line);

      return {
        id: `ACT-${String(index + 1).padStart(2, "0")}`,
        task,
        owner,
        dueDate,
        confidence,
        risk,
        riskScore,
        blockers,
        evidence: line,
        suggestedPlannerBucket: risk === "high" ? "At risk" : dueDate === "Needs date" ? "Needs clarification" : "Committed",
        followUpMessage: buildTaskMessage(owner, task, dueDate, blockers)
      };
    });

  const unique = new Map<string, ActionItem>();
  for (const item of items) {
    unique.set(`${item.owner}-${item.task.toLowerCase()}`, item);
  }

  return Array.from(unique.values()).slice(0, 10);
}

function inferOwner(line: string, speaker: string, attendees: string[]) {
  const lower = line.toLowerCase();
  const directName = attendees.find((name) => lower.includes(`${name.toLowerCase()}, can you`) || lower.includes(`${name.toLowerCase()} can you`));
  if (directName) return directName;
  if (/someone should|who will|we need to/i.test(line)) return "Unassigned";
  if (/i will|i'll|i can|i need to|i’m going to|i am going to/i.test(line) && speaker) return speaker;
  const mentioned = attendees.find((name) => lower.includes(name.toLowerCase()));
  return mentioned || speaker || "Unassigned";
}

function inferDueDate(line: string, meetingDate: string) {
  const explicit = line.match(/\b(?:by|before|due)\s+([A-Za-z]+(?:\s+\d{1,2})?(?:\s+\d{1,2}\s*(?:AM|PM))?)/i);
  if (explicit) return explicit[1].trim();
  if (/today/i.test(line)) return "Today";
  if (/tomorrow/i.test(line)) return "Tomorrow";
  if (/friday/i.test(line)) return "Friday";
  if (/thursday/i.test(line)) return "Thursday";
  if (/wednesday/i.test(line)) return "Wednesday";
  return meetingDate ? "Needs date" : "Needs date";
}

function inferBlockers(line: string) {
  const blockers = [];
  const needThenMatch = line.match(/\bi need\s+(.+?)\s+(?:first,\s*)?then\s+i will/i);
  if (needThenMatch) blockers.push(needThenMatch[1].replace(/[.]/g, "").trim());
  const blockerMatch = line.match(/\b(?:blocker|blocked|need|needs|risk is|risk)\b(.+)/i);
  if (!needThenMatch && blockerMatch && /schema|data|approval|url|access|vendor|incomplete/i.test(blockerMatch[1])) {
    blockers.push(blockerMatch[1].replace(/[.]/g, "").trim());
  }
  if (/someone should|who will|unassigned/i.test(line)) blockers.push("No confirmed owner");
  if (!/\b(?:by|before|due|today|tomorrow|monday|tuesday|wednesday|thursday|friday)\b/i.test(line)) blockers.push("No clear deadline");
  return blockers;
}

function inferConfidence(line: string, owner: string, dueDate: string) {
  let confidence = 78;
  if (owner === "Unassigned") confidence -= 24;
  if (dueDate === "Needs date") confidence -= 18;
  if (/yes|confirmed|i will/i.test(line)) confidence += 10;
  if (/someone should|maybe|can help/i.test(line)) confidence -= 10;
  return Math.max(35, Math.min(96, confidence));
}

function inferRiskScore(line: string, owner: string, dueDate: string, blockers: string[], urgency: MeetingInput["urgency"]) {
  let score = 28;
  if (owner === "Unassigned") score += 28;
  if (dueDate === "Needs date") score += 18;
  if (blockers.length) score += blockers.length * 16;
  if (/risk|blocker|incomplete|depends|need/i.test(line)) score += 14;
  if (urgency === "high") score += 8;
  if (urgency === "critical") score += 16;
  return Math.max(0, Math.min(100, score));
}

function labelRisk(score: number): ActionRisk {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function cleanTask(line: string) {
  const withoutSpeaker = line.includes(":") ? line.split(":").slice(1).join(":").trim() : line;
  const needThenMatch = withoutSpeaker.match(/\bi need\s+.+?\s+(?:first,\s*)?then\s+i will\s+(.+)/i);
  if (needThenMatch) {
    return needThenMatch[1].replace(/[.]/g, "").trim().replace(/^./, (char) => char.toUpperCase());
  }

  return withoutSpeaker
    .replace(/^(yes,\s*)?/i, "")
    .replace(/\b(i will|i'll|i can|can you|someone should|we need to|i need to)\b/i, "")
    .replace(/[.]/g, "")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function extractDecisions(lines: string[]): Decision[] {
  return lines
    .filter((line) => /\b(decided|decision|confirmed|agreed)\b/i.test(line))
    .map((line) => ({
      decision: cleanDecision(line),
      owner: line.includes(":") ? line.split(":")[0].trim() : undefined,
      evidence: line
    }))
    .slice(0, 6);
}

function cleanDecision(line: string) {
  const text = line.includes(":") ? line.split(":").slice(1).join(":").trim() : line;
  return text.replace(/\b(decision confirmed:|we decided to|decided to)\b/i, "").replace(/[.]/g, "").trim();
}

function extractQuestions(lines: string[], attendees: string[]): OpenQuestion[] {
  return lines
    .filter((line) => /\?|\bopen question\b|\bwho will\b|\bunclear\b/i.test(line))
    .map((line) => {
      const question = line.includes(":") ? line.split(":").slice(1).join(":").trim() : line;
      return {
        question: question.replace(/^open question:\s*/i, ""),
        suggestedOwner: attendees.find((name) => line.toLowerCase().includes(name.toLowerCase())) || "Meeting owner",
        whyItMatters: /screenshot|devpost|submission|final/i.test(line)
          ? "This affects the final submission package."
          : "This could block task completion if left unresolved."
      };
    })
    .slice(0, 6);
}

function buildSummary(input: MeetingInput, actions: ActionItem[], decisions: Decision[], questions: OpenQuestion[]) {
  const highRisk = actions.filter((item) => item.risk === "high").length;
  const unassigned = actions.filter((item) => item.owner === "Unassigned").length;
  return `${input.title || "This meeting"} produced ${actions.length} action items, ${decisions.length} decisions, and ${questions.length} open questions. ${highRisk} tasks are high risk and ${unassigned} need a confirmed owner.`;
}

function buildPlannerExport(actions: ActionItem[]) {
  return actions
    .map((item) => `${item.id} | ${item.suggestedPlannerBucket} | ${item.owner} | ${item.dueDate} | ${item.task} | Risk: ${item.risk.toUpperCase()}`)
    .join("\n");
}

function buildFollowUpEmail(input: MeetingInput, summary: string, actions: ActionItem[], decisions: Decision[], questions: OpenQuestion[]) {
  const actionLines = actions.map((item) => `- ${item.owner}: ${item.task} (${item.dueDate}, ${item.risk} risk)`).join("\n");
  const decisionLines = decisions.map((item) => `- ${item.decision}`).join("\n") || "- No explicit decisions captured.";
  const questionLines = questions.map((item) => `- ${item.question} — suggested owner: ${item.suggestedOwner}`).join("\n") || "- No open questions captured.";

  return `Subject: Follow-up: ${input.title || "meeting"} actions and decisions

Hi team,

Here is the accountability recap from today:

${summary}

Action items:
${actionLines || "- No action items captured."}

Decisions:
${decisionLines}

Open questions:
${questionLines}

Please reply with corrections to owners or deadlines before these are added to Planner.`;
}

function buildTaskMessage(owner: string, task: string, dueDate: string, blockers: string[]) {
  const blockerText = blockers.length ? ` Known blocker: ${blockers.join("; ")}.` : "";
  return `${owner === "Unassigned" ? "Can someone confirm an owner" : `${owner}, can you confirm`} for "${task}" due ${dueDate}?${blockerText}`;
}

function scoreAccountability(actions: ActionItem[], questions: OpenQuestion[]) {
  if (!actions.length) return 25;
  const avgConfidence = actions.reduce((sum, item) => sum + item.confidence, 0) / actions.length;
  const penalty = actions.filter((item) => item.owner === "Unassigned").length * 9 + actions.filter((item) => item.dueDate === "Needs date").length * 7 + questions.length * 3;
  return Math.max(0, Math.min(100, Math.round(avgConfidence - penalty)));
}

function buildTrace(input: MeetingInput, actions: ActionItem[], decisions: Decision[], questions: OpenQuestion[], score: number): AgentTraceStep[] {
  return [
    {
      agent: "Transcript Intake Agent",
      status: "complete",
      summary: `Read ${normalizeLines(input.transcript).length} transcript lines and normalized speaker turns.`
    },
    {
      agent: "Commitment Extraction Agent",
      status: actions.some((item) => item.owner === "Unassigned") ? "warning" : "complete",
      summary: `Found ${actions.length} candidate commitments and flagged ${actions.filter((item) => item.owner === "Unassigned").length} with missing owners.`
    },
    {
      agent: "Decision Agent",
      status: "complete",
      summary: `Captured ${decisions.length} explicit decisions from the meeting.`
    },
    {
      agent: "Risk Agent",
      status: actions.some((item) => item.risk === "high") ? "warning" : "complete",
      summary: `Scored task risk using owner clarity, deadline clarity, blockers, and urgency. Accountability score: ${score}/100.`
    },
    {
      agent: "Follow-up Agent",
      status: questions.length ? "warning" : "complete",
      summary: `Prepared Planner export, follow-up email, and ${questions.length} unresolved question prompts.`
    }
  ];
}
