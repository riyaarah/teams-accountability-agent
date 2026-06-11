# Teams Accountability Agent

> **Agents League Hackathon 2026 — Creative Apps Track · Work IQ**

An AI-powered multi-agent system that transforms Microsoft Teams meeting transcripts into structured accountability artifacts — with human review before anything ships.

![Accountability Agent](https://img.shields.io/badge/Track-Creative%20Apps-gold) ![Work IQ](https://img.shields.io/badge/IQ-Work%20IQ-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Groq](https://img.shields.io/badge/AI-Groq%20%2B%20Llama%203.3-green)

---

## What It Does

Paste a Teams transcript (or upload a `.vtt` file directly from Teams) and the agent pipeline:

1. **Extracts action items** — identifies every commitment with owner, due date, and evidence
2. **Scores risk** — flags unassigned tasks, missing dates, and blockers
3. **Captures decisions** — records explicit decisions made in the meeting
4. **Surfaces open questions** — finds unresolved questions that need follow-up
5. **Generates nudges** — drafts ready-to-send follow-up messages for at-risk tasks
6. **Produces Planner-ready rows** — exports approved tasks for Microsoft 365

All with **human review before anything leaves the app**.

---

## Features

| Feature | Description |
|---|---|
| 🤖 Multi-agent pipeline | Separate agents for extraction, risk scoring, decisions, and questions |
| 📋 Review queue | Approve, edit, or dismiss each action item before it ships |
| 🔥 Risk heatmap | Visual risk breakdown per team member |
| 🔔 Smart nudges | Auto-generated follow-up messages for blocked/high-risk tasks |
| ✅ Task tracker | Mark tasks complete, track progress with persistence |
| 📈 Score trend | Line chart of accountability scores across meetings |
| 🏆 Leaderboard | Rank team members by reliability across all meetings |
| 💬 Ask your meeting | Chat with the analysis using Llama 3.3 via Groq |
| 📁 .vtt upload | Drag and drop Teams transcript files directly |
| 🌍 Multi-language | Analyze transcripts in 9 languages |
| 📄 Export report | Download full analysis as a text report |
| 🧠 Score explainer | AI explains exactly why the accountability score is what it is |

---

## Microsoft IQ Integration

This project integrates with **Work IQ** — the intelligence layer behind Microsoft 365 Copilot.

The agent pipeline mirrors Work IQ's core capabilities:
- **Meeting memory** — extracts and structures commitments from Teams transcripts
- **People & relationships** — identifies owners, blockers, and dependencies between team members
- **Work context** — understands urgency, deadlines, and decision history
- **Accountability tracking** — scores meetings and builds longitudinal team reliability data

---

## Tech Stack

- **Frontend** — Next.js 14, React, TypeScript, Tailwind CSS
- **AI** — Llama 3.3 70B via Groq (free tier)
- **Agent pipeline** — 4 sequential agents running on the same LLM
- **Built with** — GitHub Copilot (VS Code)
- **Persistence** — localStorage for meeting history and task completions

---

## Architecture

```
Teams .vtt / Paste transcript
         ↓
   [Intake Agent]
   Parses and validates input
         ↓
   [Commitment Extraction Agent]
   Finds every task, owner, due date, blocker
         ↓
   [Decision + Question Agent]
   Captures decisions and open questions
         ↓
   [Risk & Accountability Scorer]
   Scores 0-100 based on ownership, dates, blockers
         ↓
   Human Review Queue
   Approve / Edit / Dismiss each item
         ↓
   Microsoft 365 Handoff
   Planner · To Do · Outlook · Teams
```

---

## Getting Started

```bash
git clone https://github.com/riyaarah/teams-accountability-agent
cd teams-accountability-agent
npm install
```

Create `.env.local`:
```
GROQ_API_KEY=your_groq_api_key
```

Get a free Groq API key at [console.groq.com](https://console.groq.com)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Load sample** to see the full pipeline.

---

## Demo

1. Click **Load sample** to load a realistic enterprise sales meeting transcript
2. Click **Run accountability agent** to trigger the pipeline
3. Review extracted action items in the **Review queue**
4. Explore the **Risk heatmap**, **Smart nudges**, and **Task tracker**
5. Check the **History** tab after running multiple meetings
6. Use **Ask your meeting** to chat with the analysis

---

## Hackathon

- **Event** — Agents League Hackathon @ AISF 2026
- **Track** — Creative Apps (GitHub Copilot)
- **IQ Layer** — Work IQ
- **Built by** — Riya Rahim, IITM

---

## License

MIT
