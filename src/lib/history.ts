import type { MeetingAnalysis } from "@/types/meeting";

const STORAGE_KEY = "accountability_agent_history";

export type HistoryEntry = {
  id: string;
  savedAt: string;
  analysis: MeetingAnalysis;
};

export function saveToHistory(analysis: MeetingAnalysis): void {
  if (typeof window === "undefined") return;
  const existing = loadHistory();
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    analysis,
  };
  const updated = [entry, ...existing].slice(0, 20); // keep last 20
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  const updated = loadHistory().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export type LeaderboardEntry = {
  name: string;
  totalTasks: number;
  highRiskTasks: number;
  blockedTasks: number;
  avgRiskScore: number;
  meetings: number;
};

export function buildLeaderboard(history: HistoryEntry[]): LeaderboardEntry[] {
  const map = new Map<string, LeaderboardEntry>();

  for (const entry of history) {
    for (const item of entry.analysis.actionItems) {
      const owner = item.owner === "Unassigned" ? "Unassigned" : item.owner;
      const existing = map.get(owner) ?? { name: owner, totalTasks: 0, highRiskTasks: 0, blockedTasks: 0, avgRiskScore: 0, meetings: 0 };
      map.set(owner, {
        ...existing,
        totalTasks: existing.totalTasks + 1,
        highRiskTasks: existing.highRiskTasks + (item.risk === "high" ? 1 : 0),
        blockedTasks: existing.blockedTasks + (item.blockers.length > 0 ? 1 : 0),
        avgRiskScore: Math.round((existing.avgRiskScore * existing.totalTasks + item.riskScore) / (existing.totalTasks + 1)),
        meetings: existing.meetings + 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.avgRiskScore - b.avgRiskScore);
}