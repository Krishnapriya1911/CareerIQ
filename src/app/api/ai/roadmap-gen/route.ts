/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatGroq } from "@langchain/groq";
import { NextResponse } from "next/server";
import { jsonrepair } from "jsonrepair";

// schema non-strict
const RoadmapSchema = z.object({
  roadmapTitle: z.string().optional(),
  description: z.string().optional(),
  duration: z.string().optional(),
  initialNodes: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.string().optional(),
        position: z
          .object({
            x: z.number().optional(),
            y: z.number().optional(),
          })
          .optional(),
        data: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            link: z.string().optional(), // any string allowed
          })
          .optional(),
      })
    )
    .optional(),
  initialEdges: z
    .array(
      z.object({
        id: z.string().optional(),
        source: z.string().optional(),
        target: z.string().optional(),
      })
    )
    .optional(),
});

const parser = StructuredOutputParser.fromZodSchema(RoadmapSchema as any);

function createFallbackRoadmap(field: string, timeline: string, mode: string) {
  const normalized = field.toLowerCase();
  const track = normalized.includes("cloud")
    ? [
        ["Networking and Linux", "Practice IP, DNS, Linux commands, and shell basics.", "https://roadmap.sh/devops"],
        ["Cloud fundamentals", "Learn core compute, storage, networking, and shared responsibility concepts.", "https://cloud.google.com/learn"],
        ["Identity and security", "Work through IAM, least privilege, secrets, and basic threat modeling.", "https://cloud.google.com/iam/docs"],
        ["Infrastructure as code", "Define repeatable cloud resources and keep configurations in version control.", "https://developer.hashicorp.com/terraform/tutorials"],
        ["Containers and delivery", "Package a small service and deploy it through a simple CI/CD workflow.", "https://docs.docker.com/get-started/"],
        ["Monitoring and portfolio", "Add logs, metrics, alerts, and document a deployed cloud project.", "https://cloud.google.com/monitoring/docs"],
      ]
    : normalized.includes("data") || normalized.includes("analyt")
      ? [
          ["Data foundations", "Practice spreadsheets, SQL basics, and how to ask answerable data questions.", "https://roadmap.sh/data-analyst"],
          ["SQL and data modeling", "Query relational data and design clear tables and joins.", "https://www.postgresql.org/docs/current/tutorial.html"],
          ["Python analysis", "Use Python to clean, inspect, and summarize a small dataset.", "https://pandas.pydata.org/docs/getting_started/intro_tutorials/"],
          ["Visualization", "Choose useful charts and explain the limits of the data.", "https://www.tableau.com/learn/training"],
          ["Applied project", "Answer a focused question using a public dataset and reproducible steps.", "https://github.com/skills"],
          ["Portfolio and communication", "Publish your analysis with a concise, evidence-based summary.", "https://roadmap.sh/data-analyst"],
        ]
      : [
          ["Core foundations", `Review the fundamentals needed for ${field} and build a small practice routine.`, "https://roadmap.sh"],
          ["Tools and workflow", "Set up the main tools, version your work, and learn a repeatable development workflow.", "https://github.com/skills"],
          ["Applied fundamentals", `Complete guided exercises that use the core concepts of ${field}.`, "https://roadmap.sh"],
          ["Intermediate practice", "Build a small project that combines multiple concepts and document your decisions.", "https://github.com/skills"],
          ["Specialization", `Choose one advanced area within ${field} and study its official documentation.`, "https://roadmap.sh"],
          ["Portfolio and review", "Polish one project, explain what you learned, and ask for feedback.", "https://github.com/skills"],
        ];
  const initialNodes = track.map(([title, description, link], index) => ({
    id: `node-${index + 1}`,
    type: "default",
    position: { x: (index % 3) * 280, y: Math.floor(index / 3) * 220 },
    data: { title, description, link },
  }));
  return {
    roadmapTitle: `${field} Learning Roadmap`,
    description: `A ${mode.toLowerCase()}-level starting plan for learning ${field}. Adjust the sequence to your goals and available study time.`,
    duration: timeline,
    initialNodes,
    initialEdges: initialNodes.slice(1).map((node, index) => ({
      id: `edge-${index + 1}`,
      source: `node-${index + 1}`,
      target: node.id,
    })),
    fallback: true,
  };
}



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const field = typeof body.field === "string" && body.field.trim() ? body.field.trim().slice(0, 120) : "Software Developer";
    const timeline = typeof body.timeline === "string" && body.timeline.trim() ? body.timeline.trim().slice(0, 60) : "3 months";
    const mode = typeof body.mode === "string" && body.mode.trim() ? body.mode.trim().slice(0, 40) : "Beginner";

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(createFallbackRoadmap(field, timeline, mode));
    }

    const model = new ChatGroq({
      model: "openai/gpt-oss-120b",
      temperature: 0.3,
      maxTokens: 1000,
    });

    const formatInstructions = parser.getFormatInstructions();

    const firstPrompt = `
You are an expert roadmap generator.

Task: Create a concise learning roadmap for a "${field}".

Requirements:
1. Roadmap must include:
   - roadmapTitle (short title of the roadmap)
   - description (1-2 lines summary)
   -  duration: "${timeline}"

2. initialNodes (5-8 topics):
    - Divide topics aligned to "${mode}" difficulty
    - Split into: Basics (2-3), Intermediate (2-3), Advanced (1-2)
    - Each node must have:
     • id: unique string (e.g. "node-1")
     • type: "default"
     • position: { x, y } → numeric values
     • data:
       - title: short name of the topic
       - description: 1-2 line explanation
       - link: a relevant reference link (e.g. free resource)

3. initialEdges:
   - Each edge must connect nodes logically from Basics → Intermediate → Advanced.
   - Each edge must have:
     • id: unique string (e.g. "edge-1")
     • source: source node id
     • target: target node id

Additional Rules:
- No extra commentary — only return valid JSON.
- JSON must strictly follow the schema.

${formatInstructions}
`;

    const firstResponse = await model.invoke(firstPrompt);
    // Try to repair raw JSON from first LLM
    let repairedJSON: string;
    try {
      repairedJSON = jsonrepair(firstResponse.content as string);
    } catch {
      repairedJSON = firstResponse.content as string;
    }

    // console.log("First LLM raw (possibly incomplete):", repairedJSON);

    // Second LLM to check and complete if necessary
    const secondPrompt = `
Here is the generated roadmap JSON for "${field}" for "${timeline}" in "${mode}" mode:
${repairedJSON}

Validate and repair the roadmap if needed. The JSON must satisfy ALL these conditions:

1. Has a meaningful roadmapTitle, description, and duration.
2. initialNodes:
   - topics aligned to "${mode}" difficulty
   - Contains 5-8 topics (2-3 basics, 2-3 intermediate, 1-2 advanced).
   - Each node must have:
     • id (unique string)
     • type ("default")
     • position with numeric x, y
     • data containing:
       - title (short topic name)
       - description (1-2 lines explanation)
       - link (learning resource)
3. initialEdges:
   - All nodes are connected in a clear logical sequence (basics → intermediate → advanced).
   - Each edge has id, source, and target matching valid node ids.
4. Content is concise, useful, and relevant to the "${field}" roadmap.

Rules:
- If the JSON already satisfies all requirements, return it unchanged.
- If anything is missing, incomplete, or poorly structured, correct it while keeping the original intent.
- Do NOT add extra commentary or text outside of JSON.
- Output must be valid JSON only, strictly following the schema.

${formatInstructions}
`;

    const secondResponse = await model.invoke(secondPrompt);

    // Repair second JSON before parsing
    let secondRepairedJSON: string;
    try {
      secondRepairedJSON = jsonrepair(secondResponse.content as string);
    } catch (repairErr) {
      console.warn(
        "Second JSON repair failed, using raw LLM output",
        repairErr
      );
      secondRepairedJSON = secondResponse.content as string; // fallback
    }

    // Parse second response
    const finalParsed = await parser.parse(secondRepairedJSON);

    // console.log("Final Parsed Roadmap from second LLM:", finalParsed);

    return NextResponse.json(finalParsed);
  } catch (error: any) {
    console.error("Roadmap generation error:", error);
    try {
      return NextResponse.json(createFallbackRoadmap("Software Developer", "3 months", "Beginner"));
    } catch {
      return NextResponse.json({ error: error.message || "Roadmap generation failed" }, { status: 500 });
    }
  }
}
