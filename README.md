# Teams Accountability Agent

A hackathon-ready Microsoft-style agent MVP that turns meeting transcripts into accountable work.

Instead of stopping at a meeting summary, the app extracts commitments, detects vague ownership, scores task risk, drafts follow-up messages, creates Planner-ready task rows, and shows an agent trace explaining how the output was produced.

## Why This Fits An Agent Hackathon

The product demonstrates a visible multi-agent workflow:

- Transcript Intake Agent
- Commitment Extraction Agent
- Decision Agent
- Risk Agent
- Follow-up Agent

The output is operational: tasks, owners, deadlines, blockers, risks, follow-up email, and Planner-ready export.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Next.js API routes
- Deterministic local agent pipeline for reliable demos

## Setup

```bash
cd "teams-accountability-agent"
npm install
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If port 3000 is already used:

```bash
npm run dev -- -p 3001
```

## Demo Script

1. Open the app and say: "This is a Teams Accountability Agent. It turns meetings into ownership."
2. Click **Load sample**.
3. Click **Run accountability agent**.
4. Show the accountability score and high-risk/unassigned counts.
5. Show action cards with owner, deadline, risk, blocker, evidence, and follow-up prompt.
6. Show decisions and open questions.
7. Show Planner-ready export and follow-up email.
8. End on the agent trace to prove this is not just a summary app.

## API

`POST /api/analyze`

Example request:

```json
{
  "title": "Product demo readiness sync",
  "attendees": ["Riya", "Arjun", "Priya", "Nina"],
  "meetingDate": "2026-06-05",
  "urgency": "high",
  "transcript": "Riya: We need the demo stable before Friday..."
}
```

Example response shape:

```json
{
  "title": "Product demo readiness sync",
  "executiveSummary": "Product demo readiness sync produced 8 action items...",
  "accountabilityScore": 52,
  "actionItems": [
    {
      "id": "ACT-01",
      "task": "Polish the landing page and results screen by Wednesday evening",
      "owner": "Riya",
      "dueDate": "Wednesday",
      "risk": "low",
      "riskScore": 36,
      "blockers": [],
      "evidence": "Riya: I can polish the landing page..."
    }
  ],
  "decisions": [],
  "openQuestions": [],
  "followUpEmail": "Subject: Follow-up...",
  "plannerExport": "ACT-01 | Committed | Riya | Wednesday | ...",
  "agentTrace": []
}
```

## Future Microsoft Integration

The current MVP is intentionally local and demo-stable. Strong next integrations:

- Microsoft Graph export to Planner / To Do
- Teams transcript import
- Azure AI Foundry or Microsoft Agent Framework orchestration
- Microsoft 365 Copilot extension surface
# teams-accountability-agent
