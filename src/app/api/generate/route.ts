
 import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,

});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idea, style } = body;

    const hookStyles: Record<string, string> = {
      Viral: "Write viral hooks. Use fear, urgency, curiosity. Be bold and provocative.",
      Storytelling: "Write story-driven hooks. Start with a personal moment. Build emotional tension.",
      Minimal: "Write clean minimal hooks. Short. Punchy. No fluff.",
      Corporate: "Write authority hooks. Sound like a top executive. Data-driven insights.",
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an elite LinkedIn ghostwriter who creates viral carousel posts.
Your carousels always follow this exact structure:
1. HOOK - stops the scroll, creates curiosity
2. PROBLEM - the painful problem your audience faces
3. MISTAKE - the #1 mistake people make about this topic
4. SOLUTION - the clear solution
5. FRAMEWORK - step-by-step actionable framework
6. CTA - call to action that drives engagement

Rules:
- Each slide has a short punchy title (max 8 words)
- Each slide has a description (max 2 sentences)
- Be specific, not generic
- Sound human, not like AI
- No hashtags, no emojis
- Return ONLY valid JSON array, no markdown`,
        },
        {
          role: "user",
          content: `${hookStyles[style] || ""}

Create a 6-slide LinkedIn carousel about this topic:
"${idea}"

Return ONLY this JSON format:
[
  {
    "title": "...",
    "description": "...",
    "type": "hook"
  },
  {
    "title": "...",
    "description": "...",
    "type": "problem"
  },
  {
    "title": "...",
    "description": "...",
    "type": "mistake"
  },
  {
    "title": "...",
    "description": "...",
    "type": "solution"
  },
  {
    "title": "...",
    "description": "...",
    "type": "framework"
  },
  {
    "title": "...",
    "description": "...",
    "type": "cta"
  }
]`,
        },
      ],
    });

    const raw = response.choices[0].message.content || "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const slides = JSON.parse(cleaned);
    return Response.json({ slides });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}