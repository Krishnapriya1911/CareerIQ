import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) return NextResponse.json({ error: "Media uploads are not configured" }, { status: 503 });
  try {
    const { getUploadAuthParams } = await import("@imagekit/next/server");
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!, // Your private key from .env.local
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!, // For completeness
    });

    return NextResponse.json({ token, expire, signature });
  } catch (error) {
    return NextResponse.json({ error: "Auth generation failed" }, { status: 500 });
  }
}
