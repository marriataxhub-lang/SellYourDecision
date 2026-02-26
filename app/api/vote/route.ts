import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase/client";

type VoteBody = {
  decisionId?: string;
  choice?: "A" | "B";
};

type RpcResult = {
  success: boolean;
  message: string;
};

function buildVoterHash(decisionId: string): string {
  const headerStore = headers();
  const forwarded = headerStore.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown-ip";
  const userAgent = headerStore.get("user-agent") ?? "unknown-ua";
  const salt = process.env.VOTER_HASH_SALT ?? "dev-salt-change-me";

  return createHash("sha256").update(`${decisionId}|${ip}|${userAgent}|${salt}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VoteBody;
    const decisionId = (body.decisionId ?? "").trim();
    const choice = body.choice;

    if (!decisionId || (choice !== "A" && choice !== "B")) {
      return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
    }

    const voterHash = buildVoterHash(decisionId);
    const userAgent = headers().get("user-agent") ?? "";

    const { data, error } = await supabase.rpc("cast_vote", {
      p_decision_id: decisionId,
      p_choice: choice,
      p_voter_hash: voterHash,
      p_user_agent: userAgent.slice(0, 300)
    });

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    const rpc = (Array.isArray(data) ? data[0] : data) as RpcResult | null;

    if (!rpc?.success) {
      return NextResponse.json({ ok: false, message: rpc?.message ?? "Vote failed." }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true, message: rpc.message });
    response.cookies.set(`voted_${decisionId}`, choice, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }
}
