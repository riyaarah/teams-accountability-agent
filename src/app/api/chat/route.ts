import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { messages, systemPrompt } = await request.json();

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 500,
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ]
      })
    });

    const data = await res.json();
    console.log("CHAT GROQ STATUS:", res.status);
    console.log("CHAT GROQ DATA:", JSON.stringify(data).slice(0, 300));
    const text = data.choices?.[0]?.message?.content ?? "I couldn't generate a response.";
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}