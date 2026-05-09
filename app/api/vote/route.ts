import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { castVote } from "@/lib/questions";

export const dynamic = "force-dynamic";

type VoteBody = {
  questionId?: string;
  choice?: "a" | "b";
};

export async function POST(request: Request) {
  const body = (await request.json()) as VoteBody;

  if (!body.questionId || (body.choice !== "a" && body.choice !== "b")) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  const cookieStore = await cookies();
  let visitorId = cookieStore.get("split_visitor")?.value;

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    cookieStore.set("split_visitor", visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365
    });
  }

  const result = await castVote({
    questionId: body.questionId,
    choice: body.choice,
    visitorId
  });

  return NextResponse.json(result);
}
