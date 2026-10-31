/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

interface InterviewRequest {
  jobTitle: string;
  jobDescription: string;
}

const questionSchema = z.object({
  interviewQuestions: z.array(
    z.object({
      question: z.string(),
    })
  ).min(6).max(7),
});

const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert technical interviewer.

Generate 6-7 high-quality interview questions based on:

Job Title: {jobTitle}

Job Description:
{jobDescription}

Requirements:
- Generate exactly 6 or 7 questions.
- 2 easy questions for basic understanding.
- 2-3 moderate questions for applied skills.
- 1-2 advanced questions for deep expertise or problem-solving.
- Questions must be realistic and relevant to the job description.
- Cover different areas such as theory, practical application, reasoning, technologies, and problem solving.
- Questions should be short to medium length and suitable for an oral interview.
- Do not provide answers.
- Do not include markdown or explanations.
- Return only the structured response matching the provided schema.
`);






export async function POST(request: Request) {
  try {
    const body: InterviewRequest = await request.json();
    const { jobTitle, jobDescription } = body;

    if (!jobTitle?.trim() || !jobDescription?.trim()) {
      return NextResponse.json({ isError: true, error: "Missing required fields: jobTitle and jobDescription" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      const title = jobTitle.trim().slice(0, 120);
      const interviewQuestions = [
        `What interests you about the ${title} role, and how does it fit your goals?`,
        `Which skills from the job description are your strongest, and what example demonstrates them?`,
        `Describe a project or task where you used a skill relevant to ${title}. What was your contribution?`,
        `Tell me about a technical or work problem you had to solve. How did you approach it?`,
        `How do you learn an unfamiliar tool or technology when a project requires it?`,
        `Describe a time you received feedback or worked through a disagreement with a teammate.`,
        `What would you focus on learning during your first 90 days in this ${title} role?`,
      ].map((question) => ({ question }));
      return NextResponse.json({ data: { interviewQuestions }, fallback: true });
    }

    const llm = new ChatGroq({
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      maxTokens: 1200,
      maxRetries: 3,
    });
    const structuredLlm = llm.withStructuredOutput(questionSchema);
    const chain = promptTemplate.pipe(structuredLlm);

    const result = await chain.invoke({
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim(),
    });

    return NextResponse.json({
      data: {
        interviewQuestions: result.interviewQuestions,
      },
    });
  } catch (error: any) {
    console.error("❌ QNA GENERATION ERROR:", error);

    return NextResponse.json(
      {
        isError: true,
        error:
          error?.message ||
          "Failed to generate interview questions. Please try again.",
      },
      { status: 500 }
    );
  }
}
