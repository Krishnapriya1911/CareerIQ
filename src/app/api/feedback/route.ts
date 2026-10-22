import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

const feedbackSchema = z.object({
  feedback: z.object({
    rating: z.object({
      technicalSkills: z.number().min(0).max(10),
      communication: z.number().min(0).max(10),
      problemSolving: z.number().min(0).max(10),
      experience: z.number().min(0).max(10),
    }),
    summary: z.string(),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
    recommendation: z.string(),
  }),
});

const promptTemplate = PromptTemplate.fromTemplate(`
You are an experienced technical interviewer evaluating a candidate's interview performance.

Analyze ONLY the interview conversation provided below.

Give fair, evidence-based scores. Do not invent experience, skills, or achievements that were not demonstrated.

Scoring:
- technicalSkills: 0-10
- communication: 0-10
- problemSolving: 0-10
- experience: 0-10

The feedback must contain:
1. rating
2. summary
3. strengths
4. improvements
5. recommendation

Rules:
- Be honest and fair.
- Base the evaluation only on the conversation.
- Do not assume that silence means lack of ability.
- Do not invent information.
- strengths should contain 3-5 concise points.
- improvements should contain 3-5 actionable points.
- summary should be 4-6 sentences.
- recommendation should contain 2-4 sentences.
- Do NOT use markdown.
- Do NOT include explanations outside the JSON.
- Return ONLY valid JSON.
- Do NOT wrap the JSON in markdown code fences.

The JSON MUST have exactly this structure:

{{
  "feedback": {{
    "rating": {{
      "technicalSkills": 0,
      "communication": 0,
      "problemSolving": 0,
      "experience": 0
    }},
    "summary": "string",
    "strengths": ["string", "string", "string"],
    "improvements": ["string", "string", "string"],
    "recommendation": "string"
  }}
}}

Interview conversation:

{conversation}
`);



function extractJson(text: string) {
  let cleaned = text.trim();

  // Remove markdown code fences if the model adds them anyway.
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Find the JSON object if the model added a small amount of text.
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { isError: true, error: "AI service is not configured", followUps: [] },
        { status: 503 }
      );
    }

    const llm = new ChatGroq({
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      maxTokens: 1800,
      maxRetries: 3,
    });

    const body = await req.json();

    const conversation = body?.conversation;

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        {
          error: "Interview conversation is required.",
        },
        { status: 400 }
      );
    }

    if (conversation.length === 0) {
      return NextResponse.json(
        {
          error: "Interview conversation is empty.",
        },
        { status: 400 }
      );
    }

    // Keep only the useful conversation information.
    const cleanedConversation = conversation
      .map((message: any) => {
        const role =
          message?.role ||
          message?.sender ||
          message?.type ||
          "unknown";

        const content =
          message?.content ||
          message?.message ||
          message?.text ||
          "";

        if (!content) return null;

        return `${role}: ${content}`;
      })
      .filter(Boolean)
      .join("\n");

    if (!cleanedConversation.trim()) {
      return NextResponse.json(
        {
          error: "No usable interview conversation was found.",
        },
        { status: 400 }
      );
    }

    console.log(
      "📝 Generating feedback for conversation:",
      cleanedConversation.length,
      "characters"
    );

    const chain = promptTemplate.pipe(llm);

    const response = await chain.invoke({
      conversation: cleanedConversation,
    });

    const rawContent =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    console.log("🤖 Raw feedback response received.");

    let parsedFeedback;

    try {
      parsedFeedback = extractJson(rawContent);
    } catch (parseError) {
      console.error("❌ FEEDBACK JSON PARSE ERROR:", parseError);
      console.error("Raw response:", rawContent);

      return NextResponse.json(
        {
          error: "AI returned invalid feedback JSON.",
        },
        { status: 500 }
      );
    }

    const validatedFeedback = feedbackSchema.safeParse(parsedFeedback);

    if (!validatedFeedback.success) {
      console.error(
        "❌ FEEDBACK VALIDATION ERROR:",
        validatedFeedback.error.flatten()
      );

      return NextResponse.json(
        {
          error: "AI feedback format was invalid.",
        },
        { status: 500 }
      );
    }

    console.log("✅ FEEDBACK GENERATED SUCCESSFULLY");

    return NextResponse.json({
      data: validatedFeedback.data,
    });
  } catch (error: any) {
    console.error("❌ FEEDBACK GENERATION ERROR:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        error: "Failed to generate interview feedback.",
        details:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}