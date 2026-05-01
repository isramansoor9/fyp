import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const PLACEHOLDER =
  "Content for this topic is being prepared. Check back soon for detailed learning material.";

const CONTENT_FILES_BY_LEVEL: Record<string, string[]> = {
  easy: ["EasyContentCourse1.json"],
  intermediate: ["IntermediateContentCourse1.json", "EasyContentCourse1.json"],
  advanced: ["AdvancedContentCourse1.json", "EasyContentCourse1.json"],
};
const ALL_CONTENT_FILES = [
  "EasyContentCourse1.json",
  "IntermediateContentCourse1.json",
  "AdvancedContentCourse1.json",
];

function normalizeLevel(level: string | null): string {
  const lv = (level || "").toLowerCase();
  if (lv === "hard") return "advanced";
  return CONTENT_FILES_BY_LEVEL[lv] ? lv : "easy";
}

function getContentForTitle(
  contentMap: Record<string, string>,
  title: string
): string | null {
  if (contentMap[title]) return contentMap[title];
  const trimmed = title.trim();
  if (contentMap[trimmed]) return contentMap[trimmed];
  for (const k of Object.keys(contentMap)) {
    if (k.trim() === trimmed) return contentMap[k];
  }
  const withPractical = `${trimmed} (Practical)`;
  if (contentMap[withPractical]) return contentMap[withPractical];
  const withPracticalSpace = `${trimmed} (Practical )`;
  if (contentMap[withPracticalSpace]) return contentMap[withPracticalSpace];
  const trimmedEnd = trimmed.replace(/[,.]\s*$/, "");
  if (contentMap[trimmedEnd]) return contentMap[trimmedEnd];
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
  const title = request.nextUrl.searchParams.get("title");
  const level = normalizeLevel(request.nextUrl.searchParams.get("level"));
  if (!title) {
    return NextResponse.json(
      { error: "Missing title parameter" },
      { status: 400 }
    );
  }

  try {
    const decoded = decodeURIComponent(title);
    const fileCandidates = Array.from(
      new Set([...(CONTENT_FILES_BY_LEVEL[level] || CONTENT_FILES_BY_LEVEL.easy), ...ALL_CONTENT_FILES])
    );

    for (const fileName of fileCandidates) {
      const filePath = join(process.cwd(), "content1", fileName);
      if (!existsSync(filePath)) continue;
      const fileContent = readFileSync(filePath, "utf-8");
      const contentMap: Record<string, string> = JSON.parse(fileContent);
      let content = getContentForTitle(contentMap, decoded);
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
    console.error("Error loading content:", err);
    const decoded = decodeURIComponent(title);
    return NextResponse.json({
      title: decoded,
      content: PLACEHOLDER,
    });
  }
}
