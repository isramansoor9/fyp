import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

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
  if (!title) {
    return NextResponse.json(
      { error: "Missing title parameter" },
      { status: 400 }
    );
  }

  try {
    const filePath = join(
      process.cwd(),
      "content2",
      "easycontent_base8bb.json"
    );
    const fileContent = readFileSync(filePath, "utf-8");
    const contentMap: Record<string, string> = JSON.parse(fileContent);
    const decoded = decodeURIComponent(title);
    const content = getContentForTitle(contentMap, decoded);

    if (!content) {
      return NextResponse.json(
        { error: "Content not found", title: decoded },
        { status: 404 }
      );
    }

    return NextResponse.json({ title: decoded, content });
  } catch (err) {
    console.error("Error loading content:", err);
    return NextResponse.json(
      { error: "Failed to load content" },
      { status: 500 }
    );
  }
}
