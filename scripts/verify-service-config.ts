import assert from "node:assert/strict";

// Route modules must import without provider credentials. Requests should return
// a controlled unavailable response rather than crashing the application build.
const routes = [
  "../src/app/api/ai/follow-up/route",
  "../src/app/api/ai/generate-checkpoint/route",
  "../src/app/api/ai/qna-generate/route",
  "../src/app/api/ai/quiz-feedback/route",
  "../src/app/api/ai/roadmap-gen/route",
  "../src/app/api/feedback/route",
];

async function main() {
  const originalKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  try {
    for (const path of routes) {
      const route = require(path) as { POST: (request: Request) => Promise<Response> };
      const response = await route.POST(new Request("http://localhost/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }));
      assert.equal(response.status, 503, `${path}: expected service unavailable`);
      const body = await response.json();
      assert.equal(body.error, "AI service is not configured");
      console.log(`PASS ${path}: imports and returns 503 without credentials`);
    }
  } finally {
    if (originalKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalKey;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
