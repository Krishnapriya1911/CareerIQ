/* eslint-disable @typescript-eslint/no-explicit-any */
// api/ai/quiz-feedback/route.ts

import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

interface QuizRequest {
  quizData: { section: string; question: string; answer: string }[];
  userStatus: string;
  mainFocus: string;
}

function getSchemaAndPrompt(userStatus: string, mainFocus: string) {
  if (userStatus === "12th student") {
    const schema = z.object({
      insights: z.object({
        stream: z.string().optional(),
        Interest: z.string().optional(),
        collegePreference: z.string().optional(),
        degree: z.array(z.string()).optional(),
        summary: z.string().optional(),
        careerOptions: z.array(z.string()).optional(),
      }),
    });

    const prompt = PromptTemplate.fromTemplate(`
Student Quiz Data:
{quizData}

Based on the above, extract structured career insights.

Your task:
- stream (detected stream from answers)
- Interest (student's all interests he mentioned)
- collegePreference (detect from quiz, what was student's college preference: government/private/any)
- degree (list of 2-3 relevant degrees for this student according to their stream and careerOptions)
- summary (5-6-line summary about student profile and their choices made in the quiz)
- careerOptions (list of 5 future career paths suitable for this student based only on their interest, skills and confidence level)

Return the structured response only.
`);

    return { schema, prompt };
  }

  if (userStatus !== "12th student") {
    const schema = z.object({
      insights: z.object({
        stream: z.string().optional(),
        confidence: z.string().optional(),
        Interest: z.string().optional(),
        degree: z.array(z.string()).optional(),
        summary: z.string().optional(),
        careerOptions: z.array(z.string()).optional(),
      }),
    });

    const prompt = PromptTemplate.fromTemplate(`
Student Quiz Data:
{quizData}

Based on the above, extract structured guidance for the user.

Your task:
- stream (current stream of the student)
- confidence (user's confidence level in that stream)
- Interest (user's interests mentioned in the quiz)
- degree (list of 2-3 relevant degrees for this student according to their stream and careerOptions)
- summary (4-line profile summary of the student)
- careerOptions (5 long-term career paths suitable for them according to their chosen stream)

Return the structured response only.
`);

    return { schema, prompt };
  }

  throw new Error("Unsupported userStatus + mainFocus combination");
}



export async function POST(request: Request) {
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
      maxTokens: 1200,
    });

    const body: QuizRequest = await request.json();
    const { quizData, userStatus, mainFocus } = body;

    if (!quizData || quizData.length === 0) {
      return NextResponse.json(
        { isError: true, error: "Missing quiz data" },
        { status: 400 }
      );
    }

    // Pick schema + prompt dynamically
    const { schema, prompt } = getSchemaAndPrompt(userStatus, mainFocus);

    // Use native structured output instead of manually parsing JSON.
    const structuredLlm = llm.withStructuredOutput(schema);
    const chain = prompt.pipe(structuredLlm);

    // Convert quiz data into plain string
    const quizString = quizData
      .map((q) => `${q.question}: ${q.answer}`)
      .join("\n");

    const input = {
      quizData: quizString,
    };

    const result = (await chain.invoke(input)) as z.infer<typeof schema>;

    // Normalize safely to avoid UI crashes
    const finalResult = {
      insights: Object.fromEntries(
        Object.entries(result?.insights ?? {}).map(([key, val]) => [
          key,
          Array.isArray(val) ? val.filter(Boolean) : val ?? "",
        ])
      ),
    };

    return NextResponse.json({ data: finalResult });
  } catch (error: any) {
    console.error("❌ CAREER INSIGHT ERROR:", error);

    return NextResponse.json(
      {
        isError: true,
        error: error.message || "Failed to generate insights",
      },
      { status: 500 }
    );
  }
}