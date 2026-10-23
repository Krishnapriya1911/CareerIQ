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
    for (const [path, method, env] of [
      ['../src/app/api/jobs/route', 'GET', 'SERPAPI_KEY'],
      ['../src/app/api/courses/route', 'GET', 'SERPAPI_KEY'],
      ['../src/app/api/tavily/route', 'POST', 'TAVILY_API_KEY'],
      ['../src/app/api/upload-auth/route', 'GET', 'IMAGEKIT_PRIVATE_KEY'],
      ['../src/app/api/razorpay/create-order/route', 'POST', ''],
      ['../src/app/api/razorpay/verify-payment/route', 'POST', ''],
      ['../src/app/api/ai/mocktest/security/route', 'GET', ''],
    ]) {
      const original = env ? process.env[env] : undefined;
      if (env) delete process.env[env];
      try {
        const route = require(path);
        const response = await route[method](new Request('http://localhost/api', { method }));
        assert.equal(response.status, 503, `${path}: expected unavailable`);
        assert.equal(typeof (await response.json()).error, 'string');
        console.log(`PASS ${path}: controlled unavailable response`);
      } finally {
        if (env && original !== undefined) process.env[env] = original;
      }
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
