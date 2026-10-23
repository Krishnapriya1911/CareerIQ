import { NextResponse } from "next/server";

// Accept money only after durable account-bound orders and idempotent fulfillment exist.
export async function POST() {
  return NextResponse.json({ error: "Payments are temporarily unavailable. No charge has been made." }, { status: 503 });
}
