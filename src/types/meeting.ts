export type MeetingInput = {
  title: string;
  transcript: string;
  attendees: string[];
  meetingDate: string;
  urgency: "normal" | "high" | "critical";
};

export type ActionRisk = "low" | "medium" | "high";

export type ActionItem = {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  confidence: number;
  risk: ActionRisk;
  riskScore: number;
  blockers: string[];
  evidence: string;
  suggestedPlannerBucket: string;
  followUpMessage: string;
};

export type Decision = {
  decision: string;
  owner?: string;
  evidence: string;
};

export type OpenQuestion = {
  question: string;
  suggestedOwner: string;
  whyItMatters: string;
};

export type AgentTraceStep = {
  agent: string;
  status: "complete" | "warning";
  summary: string;
};

export type MeetingAnalysis = {
  title: string;
  executiveSummary: string;
  actionItems: ActionItem[];
  decisions: Decision[];
  openQuestions: OpenQuestion[];
  followUpEmail: string;
  plannerExport: string;
  agentTrace: AgentTraceStep[];
  accountabilityScore: number;
};
