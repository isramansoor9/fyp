import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const PLACEHOLDER =
  "Content for this topic is being prepared. Check back soon for detailed learning material.";

const CONTENT_FILES_BY_LEVEL: Record<string, (semester: string) => string[]> = {
  easy: (semester) => [`EasyContentCourse3-${semester}.json`],
  intermediate: (semester) => [
    `IntermediateContentCourse3-${semester}.json`,
    `EasyContentCourse3-${semester}.json`,
  ],
  advanced: (semester) => [
    `AdvancedContentCourse3-${semester}.json`,
    `EasyContentCourse3-${semester}.json`,
  ],
};

function normalizeLevel(level: string | null): string {
  const lv = (level || "").toLowerCase();
  if (lv === "hard") return "advanced";
  return CONTENT_FILES_BY_LEVEL[lv] ? lv : "easy";
}

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

function normalizeLoose(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(theory\s*\+\s*practical\)/gi, "")
    .replace(/\(practical\)/gi, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim();
}

function findBestContentKey(keys: string[], requestedTitle: string): string | null {
  const exactNorm = normalizeLoose(requestedTitle);
  const exact = keys.find((k) => normalizeLoose(k) === exactNorm);
  if (exact) return exact;
  const contains = keys.find((k) => {
    const n = normalizeLoose(k);
    return n.includes(exactNorm) || exactNorm.includes(n);
  });
  if (contains) return contains;
  return null;
}

export async function GET(request: NextRequest) {
  const semester = request.nextUrl.searchParams.get("semester");
  const title = request.nextUrl.searchParams.get("title");
  const level = normalizeLevel(request.nextUrl.searchParams.get("level"));

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

  try {
    const decoded = decodeURIComponent(title);
    const fileCandidates = (CONTENT_FILES_BY_LEVEL[level] || CONTENT_FILES_BY_LEVEL.easy)(semester);

    for (const fileName of fileCandidates) {
      const filePath = join(process.cwd(), "content3", folder, fileName);
      if (!existsSync(filePath)) continue;
      const contentMap: Record<string, string> = JSON.parse(readFileSync(filePath, "utf-8"));
      let content = getContent(contentMap, decoded);
      if (!content) {
        const bestKey = findBestContentKey(Object.keys(contentMap), decoded);
        if (bestKey) content = contentMap[bestKey];
      }
      if (content) {
        return NextResponse.json({ title: decoded, content, levelUsed: level, sourceFile: fileName });
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
