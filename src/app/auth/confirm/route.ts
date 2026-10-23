import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = params.get("next") === "/auth-mentor/callback" ? "/auth-mentor/callback" : "/auth/callback";
  const supabase = await createClient();
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  let error: unknown = "Missing confirmation details";
  if (code) ({ error } = await supabase.auth.exchangeCodeForSession(code));
  else if (tokenHash && ["signup", "email", "magiclink", "invite", "email_change"].includes(type || "")) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType }));
  }
  if (!error) return NextResponse.redirect(new URL(next, request.url));
  return NextResponse.redirect(new URL("/auth?error=confirmation_failed", request.url));
}
