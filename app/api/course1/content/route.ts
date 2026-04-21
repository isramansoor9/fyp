import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const PLACEHOLDER =
  "Content for this topic is being prepared. Check back soon for detailed learning material.";

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

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title");
  if (!title) {
    return NextResponse.json(
      { error: "Missing title parameter" },
      { status: 400 }
    );
  }

  try {
    const filePath = join(
      process.cwd(),
      "content1",
      "finetuned_easycontent8bCourse1.json"
    );
    const decoded = decodeURIComponent(title);

    if (existsSync(filePath)) {
      const fileContent = readFileSync(filePath, "utf-8");
      const contentMap: Record<string, string> = JSON.parse(fileContent);
      const content = getContentForTitle(contentMap, decoded);

      if (content) {
        return NextResponse.json({ title: decoded, content });
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
