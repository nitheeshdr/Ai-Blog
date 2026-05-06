import { NextRequest, NextResponse } from "next/server";
import { runFeatureWorkflow } from "@/lib/github/automation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { featureName, branchPrefix = "feature", files, prTitle, prBody } = body;
    if (!featureName || !files?.length) {
      return NextResponse.json(
        { success: false, error: "featureName and files required" },
        { status: 400 }
      );
    }
    const result = await runFeatureWorkflow({
      featureName,
      branchPrefix,
      files,
      prTitle: prTitle ?? `feat: ${featureName}`,
      prBody: prBody ?? `Automated PR for: ${featureName}`,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
