import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSurveyById, getSurveyResultsSummary } from "@/lib/data";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const survey = await getSurveyById(id);

  if (!survey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await auth();
  const isAdmin = Boolean(session?.user);

  if (!isAdmin && !survey.publicResultsEnabled) {
    return NextResponse.json({ error: "Results are not public" }, { status: 403 });
  }

  const results = await getSurveyResultsSummary(id);
  if (!results) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
