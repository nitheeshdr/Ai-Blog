// ============================================================
// VERCEL CRON — runs every hour
// GET /api/cron
// ============================================================
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const secret = req.headers.get("x-cron-secret");
  if (
    process.env.CRON_SECRET &&
    secret !== process.env.CRON_SECRET &&
    process.env.NODE_ENV === "production"
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.CRON_ENABLED === "false") {
    return NextResponse.json({ message: "Cron disabled" });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    // 1. Fetch trending topics
    await fetch(`${baseUrl}/api/trending`, { method: "POST" });

    // 2. Generate article from best topic
    const res = await fetch(`${baseUrl}/api/automation/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const result = await res.json();
    console.log("[Cron] Generation result:", result);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown";
    console.error("[Cron] Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
