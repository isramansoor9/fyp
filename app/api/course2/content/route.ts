import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const CONTENT_FILES_BY_LEVEL: Record<string, string[]> = {
  easy: ["easycontent_base8bb.json"],
  intermediate: ["intermediatecontent_base8bb.json", "easycontent_base8bb.json"],
  advanced: ["hardcontent_base8bb.json", "easycontent_base8bb.json"],
};

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
  const withPractical = `${title} (Practical)`;
  if (contentMap[withPractical]) return contentMap[withPractical];
  const withPracticalSpace = `${title} (Practical )`;
  if (contentMap[withPracticalSpace]) return contentMap[withPracticalSpace];
  const trimmed = title.replace(/[,.]\s*$/, "");
  if (contentMap[trimmed]) return contentMap[trimmed];
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
    const fileCandidates = CONTENT_FILES_BY_LEVEL[level] || CONTENT_FILES_BY_LEVEL.easy;
    let content: string | null = null;
    let sourceFile = "";

    for (const fileName of fileCandidates) {
      const filePath = join(process.cwd(), "content2", fileName);
      if (!existsSync(filePath)) continue;
      const fileContent = readFileSync(filePath, "utf-8");
      const contentMap: Record<string, string> = JSON.parse(fileContent);
      content = getContentForTitle(contentMap, decoded);
      if (content) {
        sourceFile = fileName;
        break;
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: "Content not found", title: decoded },
        { status: 404 }
      );
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
