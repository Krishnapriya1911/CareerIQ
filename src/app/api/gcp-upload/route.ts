import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function POST() {
  try {
    const projectId = process.env.GCP_PROJECT_ID;
    const serviceAccountKey = process.env.GCP_SERVICE_ACCOUNT_KEY;
    const bucketName = process.env.GCP_BUCKET_ASSETS;

    if (!projectId || !serviceAccountKey || !bucketName) {
      return NextResponse.json(
        { error: "GCP configuration is missing" },
        { status: 503 }
      );
    }

    const storage = new Storage({
      projectId,
      credentials: JSON.parse(serviceAccountKey),
    });

    const bucket = storage.bucket(bucketName);

    const images = [
      "hero1.png",
      "hero2.png",
      "hero3.png",
      "jobasset1.png",
      "jobs.png",
      "linkedin.png",
      "microsoft.png",
      "prep2.png",
      "prep3.png",
      "re1.png",
      "roadmap.png",
      "search.png",
      "sec2.png",
      "sec4.jpg",
      "sec6.png",
      "sec7.png",
      "slack.png",
      "staic6.png",
      "static1.png",
      "static3.png",
      "static5.png",
      "static7.png",
      "tr1.png",
      "user.png",
    ];

    const results: { file: string; url: string }[] = [];

    for (const img of images) {
      const filePath = path.join(process.cwd(), "public", img);
      const buffer = await fs.readFile(filePath);

      const destination = `assests/${img}`;
      const file = bucket.file(destination);

      await file.save(buffer, {
        resumable: false,
        contentType: img.endsWith(".jpg") ? "image/jpeg" : "image/png",
      });

      const publicUrl =
        `https://storage.googleapis.com/${bucketName}/${destination}`;

      results.push({
        file: img,
        url: publicUrl,
      });
    }

    return NextResponse.json({
      message: `Uploaded ${results.length} images successfully`,
      files: results,
    });
  } catch (err: unknown) {
    console.error(err);

    const message =
      err instanceof Error ? err.message : "Unknown upload error";

    return NextResponse.json(
      { error: message },
      { status: 503 }
    );
  }
}
