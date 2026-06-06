import { NextResponse } from "next/server";
import { analyzeMeeting } from "@/lib/analyzer";
import type { MeetingInput } from "@/types/meeting";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<MeetingInput>;
    const transcript = body.transcript?.trim();

    if (!transcript) {
      return NextResponse.json({ error: "Add a meeting transcript or notes before running the agent." }, { status: 400 });
    }

    const analysis = analyzeMeeting({
      title: body.title?.trim() || "Untitled meeting",
      transcript,
      attendees: Array.isArray(body.attendees) ? body.attendees.filter(Boolean) : [],
      meetingDate: body.meetingDate || new Date().toISOString().slice(0, 10),
      urgency: body.urgency || "normal"
    });

    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json({ error: "The accountability agent could not process this transcript." }, { status: 500 });
  }
}
