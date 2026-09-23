import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { createClient } from "@/lib/supabase/client";
import { embedText } from "@/lib/functions/embedding";

export async function GET() {
  try {
    const projectId = process.env.GCP_PROJECT_ID;
    const serviceAccountKey = process.env.GCP_SERVICE_ACCOUNT_KEY;
    const bucketName = process.env.GCS_BUCKET;

    if (!projectId || !serviceAccountKey || !bucketName) {
      return NextResponse.json(
        { error: "GCP configuration is missing" },
        { status: 500 }
      );
    }

    const storage = new Storage({
      projectId,
      credentials: JSON.parse(serviceAccountKey),
    });

    const supabase = createClient();

    const { data: mentors, error } = await supabase
      .from("mentors")
      .select("*");

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    let ndjson = "";

    for (const m of mentors ?? []) {
      const text = `
        Mentor Name: ${m.full_name}
        Current Position: ${m.current_position}
        Bio: ${m.bio ?? ""}
      `;

      const vector = await embedText(text);

      ndjson +=
        JSON.stringify({
          id: String(m.id),
          embedding: vector,
          payload: {
            full_name: m.full_name,
            current_position: m.current_position,
            bio: m.bio ?? "",
          },
        }) + "\n";
    }

    const filename = `mentors-${Date.now()}.json`;

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(`vector/${filename}`);

    await file.save(ndjson, {
      resumable: false,
      contentType: "application/json",
    });

    return NextResponse.json({
      message: "Uploaded!",
      gcsUri: `gs://${bucketName}/vector/${filename}`,
    });
  } catch (error: unknown) {
    console.error("Vector upload error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown vector upload error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
