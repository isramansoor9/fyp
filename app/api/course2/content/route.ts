import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const CONTENT_FILES_BY_LEVEL: Record<string, string[]> = {
  easy: ["EasyContentCourse2.json"],
  intermediate: ["IntermediateContentCourse2.json", "EasyContentCourse2.json"],
  advanced: ["AdvancedContentCourse2.json", "EasyContentCourse2.json"],
};
const ALL_CONTENT_FILES = [
  "EasyContentCourse2.json",
  "IntermediateContentCourse2.json",
  "AdvancedContentCourse2.json",
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
  const trimmedTitle = title.trim();
  if (contentMap[trimmedTitle]) return contentMap[trimmedTitle];
  const withPractical = `${title} (Practical)`;
  if (contentMap[withPractical]) return contentMap[withPractical];
  const withPracticalSpace = `${title} (Practical )`;
  if (contentMap[withPracticalSpace]) return contentMap[withPracticalSpace];
  const trimmed = title.replace(/[,.]\s*$/, "");
  if (contentMap[trimmed]) return contentMap[trimmed];
  for (const k of Object.keys(contentMap)) {
    if (k.trim() === trimmedTitle) return contentMap[k];
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
    let content: string | null = null;
    let sourceFile = "";

    for (const fileName of fileCandidates) {
      const filePath = join(process.cwd(), "content2", fileName);
      if (!existsSync(filePath)) continue;
      const fileContent = readFileSync(filePath, "utf-8");
      const contentMap: Record<string, string> = JSON.parse(fileContent);
      content = getContentForTitle(contentMap, decoded);
      if (!content) {
        const bestKey = findBestContentKey(Object.keys(contentMap), decoded);
        if (bestKey) content = contentMap[bestKey];
      }
      if (content) {
        sourceFile = fileName;
        break;
      }
    }

    if (!content) {
      return NextResponse.json({
        title: decoded,
        content: "Content for this topic is being prepared. Check back soon for detailed learning material.",
      });
    }

    return NextResponse.json({ title: decoded, content, levelUsed: level, sourceFile });
  } catch (err) {
    console.error("Error loading content:", err);
    return NextResponse.json(
      { error: "Failed to load content" },
      { status: 500 }
    );
  }
}
