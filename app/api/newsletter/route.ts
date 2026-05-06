import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = getServerClient();
  try {
    const body = await req.json();
    const { email, name } = schema.parse(body);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, name, confirmed: true }, { onConflict: "email" });
    if (error) throw error;
    return NextResponse.json({ success: true, message: "Successfully subscribed!" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unknown";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  const supabase = getServerClient();
  const { count } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true })
    .eq("confirmed", true);
  return NextResponse.json({ success: true, data: { count: count ?? 0 } });
}
