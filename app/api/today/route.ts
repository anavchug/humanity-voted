import { NextResponse } from "next/server";
import { getTodayQuestion } from "@/lib/questions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const visitorId = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("split_visitor="))
    ?.split("=")[1];

  const question = await getTodayQuestion(visitorId);

  return NextResponse.json(question);
}
