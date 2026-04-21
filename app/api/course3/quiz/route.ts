import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

type QAPair = { Question: string; Answer: string; Difficulty: string; KnowledgeDimension?: string };
type QASource = { url?: string; transcript?: string; qa_pairs: QAPair[] };
type QAMap = Record<string, QASource[]>;

const LEVEL_MAP: Record<string, { primary: string[]; secondary: string[] }> = {
  easy: { primary: ["Easy"], secondary: ["Intermediate"] },
  intermediate: { primary: ["Intermediate"], secondary: ["Hard"] },
  advanced: { primary: ["Hard"], secondary: ["Intermediate"] },
};

function findBestTopicKey(keys: string[], subtopic: string): string | null {
  const s = subtopic.trim().toLowerCase();
  const exact = keys.find((k) => k.trim().toLowerCase() === s);
  if (exact) return exact;
  const contains = keys.find((k) => k.trim().toLowerCase().includes(s) || s.includes(k.trim().toLowerCase()));
  if (contains) return contains;
  const partial = keys.find((k) => {
    const kWords = k.toLowerCase().split(/\s+/);
    const sWords = s.split(/\s+/);
    return sWords.some((w) => w.length > 2 && kWords.some((kw) => kw.includes(w) || w.includes(kw)));
  });
  return partial || keys[0];
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title");
  const level = request.nextUrl.searchParams.get("level") || "easy";
  const semester = request.nextUrl.searchParams.get("semester") || "1";

  if (!title) {
    return NextResponse.json({ error: "Missing title parameter" }, { status: 400 });
  }

  const decoded = decodeURIComponent(title);
  const levels = LEVEL_MAP[level] || LEVEL_MAP.easy;
  const primaryCount = 3;
  const secondaryCount = 2;

  const folder = semester === "2" ? "Course3-2" : "Course3-1";
  const fileName = semester === "2" ? "Course3-2QAs.json" : "Course3-1QAs.json";

  try {
    const filePath = join(process.cwd(), "content3", folder, fileName);
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Quiz data not found" }, { status: 404 });
    }

    const qaMap: QAMap = JSON.parse(readFileSync(filePath, "utf-8"));
    const keys = Object.keys(qaMap);
    const topicKey = findBestTopicKey(keys, decoded) || keys[0];

    const sources = qaMap[topicKey] || [];
    const allPairs: QAPair[] = [];
    sources.forEach((src) => {
      if (src.qa_pairs?.length) {
        src.qa_pairs.forEach((qa) => allPairs.push({ ...qa, KnowledgeDimension: (qa as { KnowledgeDimension?: string }).KnowledgeDimension }));
      }
    });

    const allForTopic = request.nextUrl.searchParams.get("all") === "true";
    if (allForTopic) {
      return NextResponse.json({
        questions: allPairs.slice(0, 50).map((q) => ({ question: q.Question, answer: q.Answer, difficulty: q.Difficulty, knowledgeDimension: q.KnowledgeDimension ?? "Factual" })),
        quizQAs: allPairs.slice(0, 50).map((q) => ({ Question: q.Question, Answer: q.Answer, Difficulty: q.Difficulty, KnowledgeDimension: q.KnowledgeDimension ?? "Factual" })),
      });
    }

    const primary = shuffle(allPairs.filter((q) => levels.primary.includes(q.Difficulty)));
    const secondary = shuffle(allPairs.filter((q) => levels.secondary.includes(q.Difficulty)));
    const selected = [
      ...primary.slice(0, primaryCount),
      ...secondary.slice(0, secondaryCount),
    ];
    const needMore = 5 - selected.length;
    if (needMore > 0) {
      const remaining = shuffle(allPairs.filter((q) => !selected.includes(q)));
      selected.push(...remaining.slice(0, needMore));
    }
    const shuffled = shuffle(selected.length > 0 ? selected : allPairs.slice(0, 5));

    return NextResponse.json({
      questions: shuffled.map((q) => ({
        question: q.Question,
        answer: q.Answer,
        difficulty: q.Difficulty,
        knowledgeDimension: (q as { KnowledgeDimension?: string }).KnowledgeDimension ?? "Factual",
      })),
    });
  } catch (err) {
    console.error("Quiz API error:", err);
    return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
  }
}
