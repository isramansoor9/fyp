import { NextRequest, NextResponse } from "next/server";
import { COURSE3_SEMESTER1, COURSE3_SEMESTER2 } from "../toc-data";

export async function GET(request: NextRequest) {
  const semester = request.nextUrl.searchParams.get("semester");
  if (!semester || (semester !== "1" && semester !== "2")) {
    return NextResponse.json(
      { error: "Missing or invalid semester (use 1 or 2)" },
      { status: 400 }
    );
  }

  const toc = semester === "1" ? COURSE3_SEMESTER1 : COURSE3_SEMESTER2;
  return NextResponse.json({
    semester: toc.semester,
    topics: toc.topics,
  });
}
