import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  if (request.nextUrl.pathname === "/api/health") return response;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        response.headers.set("Cache-Control", "private, no-store");
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    } },
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  if (error || !user) {
    if (isApi) return NextResponse.json({ error: "Sign in required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.pathname.startsWith("/dashboard") ? "/auth-mentor" : "/auth";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (["/api/embed", "/api/vector/upload", "/api/gcp-upload"].includes(request.nextUrl.pathname) && user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  }
  if (isApi && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  return response;
}

export const config = { matcher: ["/home/:path*", "/dashboard/:path*", "/room/:path*", "/start-quiz", "/api/:path*"] };
