import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const PLACEHOLDER =
  "Content for this topic is being prepared. Check back soon for detailed learning material.";

/** Normalize "(Theory + Practical)" variants for matching (with/without space before paren). */
function normalizeTheoryPractical(s: string): string {
  return s
    .replace(/\s*\(\s*Theory\s*\+\s*Practical\s*\)\s*$/i, "(Theory + Practical)")
    .trim();
}

function getContent(
  contentMap: Record<string, string>,
  title: string
): string | null {
  if (contentMap[title]) return contentMap[title];
  const trimmed = title.trim();
  if (contentMap[trimmed]) return contentMap[trimmed];
  for (const k of Object.keys(contentMap)) {
    if (k.trim() === trimmed) return contentMap[k];
  }
  const withSuffix = trimmed + " (Theory + Practical)";
  if (contentMap[withSuffix]) return contentMap[withSuffix];
  for (const k of Object.keys(contentMap)) {
    if (k.trim() === withSuffix) return contentMap[k];
  }
  // Match by normalized form so "X (Y) (Theory + Practical)" matches "X (Y)(Theory + Practical)"
  const requestedNorm = normalizeTheoryPractical(trimmed);
  for (const k of Object.keys(contentMap)) {
    if (normalizeTheoryPractical(k) === requestedNorm) return contentMap[k];
  }
  return null;
}

export async function GET(request: NextRequest) {
  const semester = request.nextUrl.searchParams.get("semester");
  const title = request.nextUrl.searchParams.get("title");

  if (!semester || (semester !== "1" && semester !== "2")) {
    return NextResponse.json(
      { error: "Missing or invalid semester (use 1 or 2)" },
      { status: 400 }
    );
  }
  if (!title) {
    return NextResponse.json(
      { error: "Missing title parameter" },
      { status: 400 }
    );
  }

  const folder = semester === "1" ? "Course3-1" : "Course3-2";
  const filePath = join(
    process.cwd(),
    "content3",
    folder,
    "finetuned_easycontent8bCourse3-" + semester + ".json"
  );

  try {
    const decoded = decodeURIComponent(title);

    if (existsSync(filePath)) {
      const contentMap: Record<string, string> = JSON.parse(
        readFileSync(filePath, "utf-8")
      );
      const content = getContent(contentMap, decoded);
      if (content) {
        return NextResponse.json({ title: decoded, content });
      }
    }

    return NextResponse.json({
      title: decoded,
      content: PLACEHOLDER,
    });
  } catch (err) {
    console.error("Error loading course3 content:", err);
    return NextResponse.json({
      title: decodeURIComponent(title),
      content: PLACEHOLDER,
    });
  }
}
