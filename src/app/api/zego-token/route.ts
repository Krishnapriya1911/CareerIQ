import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Video meeting token generation is not configured in this environment.",
    },
    { status: 503 }
  );
}
