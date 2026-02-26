import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { FORBIDDEN_MESSAGE, hasForbiddenContent } from "@/lib/utils/moderation";

const allowedDurations = new Set([24, 48, 72]);
const allowedCategories = new Set(["Career", "Relationships", "Lifestyle", "Money (safe)", "Other"]);

type CreateBody = {
  title?: string;
  details?: string;
  optionA?: string;
  optionB?: string;
  durationHours?: number;
  category?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateBody;

    const title = (body.title ?? "").trim();
    const details = (body.details ?? "").trim();
    const optionA = (body.optionA ?? "").trim();
    const optionB = (body.optionB ?? "").trim();
    const durationHours = Number(body.durationHours ?? 24);
    const category = (body.category ?? "Other").trim();

    if (!title || !details || !optionA || !optionB) {
      return NextResponse.json({ ok: false, message: "Missing required fields." }, { status: 400 });
    }

    if (title.length > 90 || details.length > 800 || optionA.length > 40 || optionB.length > 40) {
      return NextResponse.json({ ok: false, message: "One or more fields exceed limits." }, { status: 400 });
    }

    if (!allowedDurations.has(durationHours)) {
      return NextResponse.json({ ok: false, message: "Invalid duration." }, { status: 400 });
    }

    if (!allowedCategories.has(category)) {
      return NextResponse.json({ ok: false, message: "Invalid category." }, { status: 400 });
    }

    if (hasForbiddenContent(`${title} ${details}`)) {
      return NextResponse.json({ ok: false, message: FORBIDDEN_MESSAGE }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("decisions")
      .insert({
        title,
        details,
        option_a: optionA,
        option_b: optionB,
        category,
        expires_at: expiresAt
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, message: error?.message ?? "Insert failed." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }
}
